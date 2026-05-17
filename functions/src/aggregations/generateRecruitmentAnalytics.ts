import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Runs daily at midnight EAT (timezone: 'Africa/Nairobi' -> ~21:00 UTC) to aggregate recruitment data.
 */
export const generateRecruitmentAnalytics = onSchedule({
    schedule: "every day 00:00",
    timeZone: "Africa/Nairobi",
    timeoutSeconds: 300,
    memory: "512MiB"
}, async (event) => {
    logger.info("Starting Daily Recruitment Analytics Aggregation...");
    const db = admin.firestore();
    const now = new Date();

    try {
        // --- 1. Total Funnel Setup ---
        let totalJobPosts = 0;
        let totalApplications = 0;
        let shortlistedCandidates = 0;
        let interviewsConducted = 0;
        let successfulHires = 0;

        // --- 2. Employer Data Setup ---
        const employerStatsMap = new Map<string, { name: string, jobs: number, applications: number, hires: number }>();

        // --- 3. Category Data Setup ---
        const categoryStatsMap = new Map<string, { category: string, jobs: number, applications: number, totalSalaryRange: number }>();

        // --- 4. Valid Jobs Tracking ---
        const validJobIds = new Set<string>();

        // First pass: Iterate over all jobs
        const jobsSnapshot = await db.collection("jobs").get();
        jobsSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Ignore draft jobs and jobs without a status (to match admin dashboard behavior)
            const status = data.status ? data.status.toLowerCase() : null;
            if (!status || status === 'draft') {
                return;
            }

            validJobIds.add(doc.id);
            totalJobPosts++;

            // Track Employer Stats
            const employerId = data.employerId || "unknown";
            const companyName = data.company_name || data.employerName || "Unknown Employer";
            
            if (!employerStatsMap.has(employerId)) {
                employerStatsMap.set(employerId, { name: companyName, jobs: 0, applications: 0, hires: 0 });
            }
            employerStatsMap.get(employerId)!.jobs++;

            // Track Category Stats
            const cats = data.required_license_category || [];
            const safeCats = Array.isArray(cats) ? cats : [cats]; // Handle legacy string definitions
            
            // Average the salary field if present (e.g. { from: 400000, to: 800000 })
            const salaryObj = data.salary;
            const avgJobSalary = salaryObj ? ((Number(salaryObj.from) || 0) + (Number(salaryObj.to) || 0)) / 2 : 0;

            safeCats.forEach((catStr: string) => {
                if (typeof catStr !== 'string') return;
                const cat = catStr.trim().toUpperCase();
                if (!categoryStatsMap.has(cat)) {
                    categoryStatsMap.set(cat, { category: cat, jobs: 0, applications: 0, totalSalaryRange: 0 });
                }
                const cStats = categoryStatsMap.get(cat)!;
                cStats.jobs++;
                if (avgJobSalary > 0) {
                    cStats.totalSalaryRange += avgJobSalary;
                }
            });
        });

        // Second pass: Iterate over all job applications
        const appsSnapshot = await db.collection("job_applications").get();
        appsSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Ignore applications that don't belong to a valid job
            if (!data.jobId || !validJobIds.has(data.jobId)) {
                return;
            }

            totalApplications++;
            
            const status = (data.status || 'applied').toLowerCase();
            
            if (status === 'shortlisted' || status === 'interview' || status === 'hired' || status === 'accepted') {
                shortlistedCandidates++;
            }
            
            if (status === 'interview' || status === 'hired' || status === 'accepted') {
                interviewsConducted++;
            }
            
            if (status === 'hired' || status === 'accepted') {
                successfulHires++;
            }

            // Update Employer Stats (Requires traversing to lookup employerId, using the jobId provided)
            const employerId = data.employerId || "unknown"; // If stored on the application level
            if (employerStatsMap.has(employerId)) {
                const eStats = employerStatsMap.get(employerId)!;
                eStats.applications++;
                if (status === 'hired' || status === 'accepted') {
                    eStats.hires++;
                }
            }

            // Update Category Stats
            // Applications don't always carry the category, so we'd normally index it against the job. 
            // For simple analytics, we map any known profile categories of the driver. (If stored).
            // (Assuming data shape limits complex joins without excessive reads, skipping pure map joins for now)
        });

        // Parse Maps back to Arrays
        const topEmployers = Array.from(employerStatsMap.values())
            .filter(emp => emp.name !== 'Unknown Employer')
            .sort((a, b) => b.applications - a.applications)
            .slice(0, 5);

        const categoryStats = Array.from(categoryStatsMap.values())
            .map(c => ({
                category: c.category,
                jobs: c.jobs,
                applications: c.applications, // Note: Advanced aggregation would tally these via job relation
                avgSalary: c.jobs > 0 && c.totalSalaryRange > 0 ? Math.round(c.totalSalaryRange / c.jobs) : 0
            }))
            .sort((a, b) => b.jobs - a.jobs)
            .slice(0, 5);

        // Funnel calculation
        const funnel = {
            totalJobPosts,
            totalApplications,
            shortlistedCandidates,
            interviewsConducted,
            successfulHires
        };

        // Summary structure
        const payload = {
            funnel,
            topEmployers,
            categoryStats,
            lastAggregated: admin.firestore.Timestamp.fromDate(now)
        };

        // Write directly to 'system_metrics' collection
        await db.collection("system_metrics").doc("recruitment_analytics").set(payload, { merge: true });

        logger.info("Successfully generated recruitment analytics snapshot.", { payload });

    } catch (error) {
        logger.error("Error generating recruitment analytics", { error });
    }
});
