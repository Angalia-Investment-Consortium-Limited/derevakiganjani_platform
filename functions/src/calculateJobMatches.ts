import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const calculateJobMatches = onCall({ 
    cpu: 1, 
    memory: '512MiB', 
    region: 'us-central1', 
    enforceAppCheck: false 
}, async (request) => {
    logger.info("--- calculateJobMatches: Start ---", { data: request.data });

    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }

    const { jobId } = request.data;
    if (!jobId) {
        throw new HttpsError("invalid-argument", "Missing jobId.");
    }

    try {
        const db = admin.firestore();
        
        // 1. Fetch Job
        const jobDoc = await db.collection("jobs").doc(jobId).get();
        if (!jobDoc.exists) {
            throw new HttpsError("not-found", "Job not found.");
        }
        const jobData = jobDoc.data()!;

        // 2. Fetch/Pre-filter Drivers
        // Fetch up to 50 drivers to keep within prompt size limits for quick testing
        const driversSnapshot = await db.collection("driver_profiles").limit(50).get();
        
        const candidateDrivers: any[] = [];
        driversSnapshot.docs.forEach(doc => {
            const data = doc.data();
            candidateDrivers.push({
                driverId: doc.id,
                fullName: data.fullName || "Unknown",
                licenseNumber: data.licenseNumber || "None",
                skills: data.skills || [],
                bio: data.bio || "",
                experience: data.experience || "Unknown" // assuming experience is sometimes stored directly
            });
        });

        if (candidateDrivers.length === 0) {
            return { success: true, message: "No driver candidates found to match.", matchesCount: 0 };
        }

        // 3. Call Vertex AI
        const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId : null;
        let ai;
        if (projectId) {
            // @ts-ignore
            ai = new GoogleGenAI({ vertexai: { project: projectId, location: 'us-central1' } });
        } else {
            // Fallback for local emulation if project ID is not set. 
            // Warning: Vertex AI requires explicit project/location if not correctly inferred from ADC.
            logger.warn("Project ID not found in env, trying to initialize GoogleGenAI without explicit vertexai object (might fail if not using API_KEY)");
            ai = new GoogleGenAI({}); 
        }

        const prompt = `
You are an expert HR recruiter matching commercial drivers to job postings.
I will provide you with a Job Description JSON, and a list of Candidate Drivers JSON.
Your task is to evaluate each driver against the job requirements and provide a match score from 0 to 100.
Also, provide a short reasoning. 
Sort the top matching drivers by score descending. Return the top 10 matches at most. Ensure you return valid JSON containing an array of objects.

Job Description:
${JSON.stringify({
    title: jobData.job_title,
    description: jobData.job_description,
    required_skills: jobData.required_skills,
    required_license: jobData.required_license_category,
    experience_years: jobData.minimum_experience_years
}, null, 2)}

Candidate Drivers:
${JSON.stringify(candidateDrivers, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            driverId: { type: "STRING" },
                            score: { type: "INTEGER" },
                            reasoning: { type: "STRING" },
                            category: { type: "STRING", description: "Inferred license category of the driver based on their data" },
                            experience: { type: "STRING", description: "Extracted years of experience" }
                        },
                        required: ["driverId", "score", "reasoning", "category", "experience"]
                    }
                }
            }
        });

        const textResponse = response.text;
        if (!textResponse) {
             throw new Error("No response from AI");
        }

        const topMatches = JSON.parse(textResponse);

        // Map driver names into the match object for easier UI display
        const enrichedMatches = topMatches.map((match: any) => {
            const driverInfo = candidateDrivers.find(d => d.driverId === match.driverId);
            return {
                ...match,
                name: driverInfo ? driverInfo.fullName : "Unknown Driver"
            };
        });

        // 4. Save result to job_matches collection
        const resultPayload = {
            jobId,
            employerId: jobData.employerId || "",
            totalMatchesFound: enrichedMatches.length,
            lastCalculatedAt: admin.firestore.FieldValue.serverTimestamp(),
            topMatches: enrichedMatches
        };

        await db.collection("job_matches").doc(jobId).set(resultPayload);

        logger.info(`Successfully generated ${enrichedMatches.length} matches for job ${jobId}`);
        return { success: true, matchesCount: enrichedMatches.length, result: resultPayload };

    } catch (error: any) {
        logger.error("Error in calculateJobMatches:", error);
        throw new HttpsError("internal", error.message || "An unexpected error occurred during AI matching.");
    }
});
