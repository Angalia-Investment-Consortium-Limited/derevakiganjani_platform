import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const getAdminReports = onCall({
    enforceAppCheck: false,
    region: 'us-central1'
}, async (request) => {
    logger.info("--- getAdminReports: Start ---", { data: request.data });

    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const { dateFrom, dateTo, region } = request.data as { dateFrom?: string, dateTo?: string, region?: string };

    const db = admin.firestore();
    
    // Parse Dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (dateFrom) {
        startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
    }
    
    if (dateTo) {
        endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
    }
    
    // Aggregations
    try {
        // --- 1. LICENSES ---
        let licensesQuery: admin.firestore.Query = db.collection('license_applications');
        if (startDate) licensesQuery = licensesQuery.where('submittedOn', '>=', admin.firestore.Timestamp.fromDate(startDate));
        if (endDate) licensesQuery = licensesQuery.where('submittedOn', '<=', admin.firestore.Timestamp.fromDate(endDate));
        if (region && region !== 'all') licensesQuery = licensesQuery.where('region', '==', region);
        
        const licensesSnapshot = await licensesQuery.get();
        
        const licensesStats = {
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
            renewals: 0,
            newApplications: 0,
            byCategory: {} as Record<string, any>
        };

        licensesSnapshot.forEach(doc => {
            const data = doc.data();
            licensesStats.total++;
            
            const status = (data.status || 'pending').toLowerCase();
            const type = (data.applicationType || 'new').toLowerCase();
            
            if (status === 'approved') licensesStats.approved++;
            else if (status === 'rejected') licensesStats.rejected++;
            else licensesStats.pending++;
            
            if (type === 'renewal') licensesStats.renewals++;
            else licensesStats.newApplications++;
            
            const cats = data.categories || [];
            if (Array.isArray(cats)) {
                cats.forEach((c: string) => {
                    if (!licensesStats.byCategory[c]) {
                         licensesStats.byCategory[c] = { category: c, new: 0, renewals: 0, approved: 0, rejected: 0, pending: 0, total: 0 };
                    }
                    licensesStats.byCategory[c].total++;
                    if (status === 'approved') licensesStats.byCategory[c].approved++;
                    else if (status === 'rejected') licensesStats.byCategory[c].rejected++;
                    else licensesStats.byCategory[c].pending++;
                    
                    if (type === 'renewal') licensesStats.byCategory[c].renewals++;
                    else licensesStats.byCategory[c].new++;
                });
            }
        });

        // --- 2. JITESTI ---
        let testsQuery: admin.firestore.Query = db.collection('test_attempts');
        if (startDate) testsQuery = testsQuery.where('startTime', '>=', admin.firestore.Timestamp.fromDate(startDate));
        if (endDate) testsQuery = testsQuery.where('startTime', '<=', admin.firestore.Timestamp.fromDate(endDate));
        
        const testsSnapshot = await testsQuery.get();
        const testsStats = {
            totalAttempts: 0,
            passed: 0,
            failed: 0,
            avgScore: 0,
            passRate: 0,
            byCategory: {} as Record<string, any>
        };

        let totalScore = 0;
        let scoredTests = 0;

        testsSnapshot.forEach(doc => {
            const data = doc.data();
            testsStats.totalAttempts++;
            
            const score = data.score != null ? data.score : 0;
            const passMark = data.passMark || 0;
            const catName = data.categoryTitle || data.categoryId || 'Unknown';
            const catId = data.categoryId || 'unknown';

            if ((data.status === 'completed' || data.status === 'finished') && data.score != null) {
                scoredTests++;
                totalScore += score;
                const passed = score >= passMark;
                if (passed) testsStats.passed++;
                else testsStats.failed++;

                if (!testsStats.byCategory[catId]) {
                    testsStats.byCategory[catId] = { id: catId, name: catName, attempts: 0, passed: 0, totalScore: 0, avgScore: 0, passRate: 0, avgTimeMinutes: data.durationInMinutes || 0 };
                }
                testsStats.byCategory[catId].attempts++;
                if (passed) testsStats.byCategory[catId].passed++;
                testsStats.byCategory[catId].totalScore += score;
                // Running average time estimation for simplicity
                if (data.durationInMinutes) {
                    const currentAvg = testsStats.byCategory[catId].avgTimeMinutes;
                    testsStats.byCategory[catId].avgTimeMinutes = (currentAvg + data.durationInMinutes) / 2;
                }
            }
        });

        if (scoredTests > 0) {
            testsStats.avgScore = totalScore / scoredTests;
            testsStats.passRate = (testsStats.passed / scoredTests) * 100;
        }

        Object.values(testsStats.byCategory).forEach((cat: any) => {
             cat.avgScore = cat.attempts > 0 ? cat.totalScore / cat.attempts : 0;
             cat.passRate = cat.attempts > 0 ? (cat.passed / cat.attempts) * 100 : 0;
        });

        // --- 3. RECRUITMENT/JOBS ---
        let jobsQuery: admin.firestore.Query = db.collection('jobs');
        if (startDate) jobsQuery = jobsQuery.where('posted_date', '>=', admin.firestore.Timestamp.fromDate(startDate));
        if (endDate) jobsQuery = jobsQuery.where('posted_date', '<=', admin.firestore.Timestamp.fromDate(endDate));
        if (region && region !== 'all') jobsQuery = jobsQuery.where('region', '==', region);

        const jobsSnapshot = await jobsQuery.get();
        
        const jobsStats = {
             totalPosts: 0,
             activePosts: 0,
             filledPositions: 0,
             expiredPosts: 0,
        };

        const now = new Date();
        jobsSnapshot.forEach(doc => {
            const data = doc.data();
            jobsStats.totalPosts++;
            const status = (data.status || 'open').toLowerCase();
            
            let isExpired = false;
            if (data.application_deadline) {
                let deadline: Date;
                if (typeof data.application_deadline.toDate === 'function') {
                    deadline = data.application_deadline.toDate();
                } else {
                    deadline = new Date(data.application_deadline);
                }
                if (!isNaN(deadline.getTime()) && deadline < now) isExpired = true;
            }

            if (status === 'closed' || status === 'filled') {
                jobsStats.filledPositions++;
            } else if (isExpired) {
                jobsStats.expiredPosts++;
            } else if (status === 'open' || status === 'published') {
                jobsStats.activePosts++;
            }
        });

        let applicationsQuery: admin.firestore.Query = db.collection('job_applications');
        if (startDate) applicationsQuery = applicationsQuery.where('application_date', '>=', admin.firestore.Timestamp.fromDate(startDate));
        if (endDate) applicationsQuery = applicationsQuery.where('application_date', '<=', admin.firestore.Timestamp.fromDate(endDate));
        
        const applicationsSnapshot = await applicationsQuery.get();
        const applicationStats = {
             totalApplications: 0,
             pendingReview: 0,
             shortlisted: 0,
             hired: 0
        };

        applicationsSnapshot.forEach(doc => {
             const data = doc.data();
             applicationStats.totalApplications++;
             const status = (data.status || '').toLowerCase();
             
             if (status === 'shortlisted') applicationStats.shortlisted++;
             else if (status === 'hired' || status === 'accepted') applicationStats.hired++;
             else applicationStats.pendingReview++;
        });

        // --- 4. FINANCE ---
        let paymentsQuery: admin.firestore.Query = db.collection('payments');
        if (startDate) paymentsQuery = paymentsQuery.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate));
        if (endDate) paymentsQuery = paymentsQuery.where('createdAt', '<=', admin.firestore.Timestamp.fromDate(endDate));

        const paymentsSnapshot = await paymentsQuery.get();
        const financeStats = {
            totalRevenue: 0,
            byService: {} as Record<string, { service: string, totalAmount: number, transactions: number, avgTransaction: number }>
        };

        paymentsSnapshot.forEach(doc => {
             const data = doc.data();
             const status = (data.status || '').toLowerCase();
             if (status === 'completed' || status === 'success') {
                 const amount = Number(data.amount) || 0;
                 financeStats.totalRevenue += amount;
                 
                 const service = data.service || 'Unknown';
                 if (!financeStats.byService[service]) {
                      financeStats.byService[service] = { service, totalAmount: 0, transactions: 0, avgTransaction: 0 };
                 }
                 financeStats.byService[service].totalAmount += amount;
                 financeStats.byService[service].transactions++;
             }
        });
        
        Object.values(financeStats.byService).forEach((srv: any) => {
             srv.avgTransaction = srv.transactions > 0 ? srv.totalAmount / srv.transactions : 0;
        });

        // Overview combined
        const overview = {
             totalActiveDrivers: 0,
             totalActivePosts: jobsStats.activePosts,
             pendingApprovals: licensesStats.pending,
             totalRevenue: financeStats.totalRevenue
        };

        try {
            const driversCount = await db.collection('driver_profiles').count().get();
            overview.totalActiveDrivers = driversCount.data().count;
        } catch (e) {
            logger.warn("Could not fetch drivers count", e);
        }

        return {
            licenses: licensesStats,
            jitesti: testsStats,
            jobs: { ...jobsStats, ...applicationStats },
            finance: financeStats,
            overview
        };

    } catch (error) {
        logger.error("Error generating admin reports", error);
        throw new HttpsError("internal", "Failed to generate reports.");
    }
});
