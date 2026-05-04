import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

// Initialise admin if not already initialised
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const onNewJobPosted = onDocumentCreated("jobs/{jobId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const jobId = event.params.jobId;
  const jobData = snapshot.data();
  
  // Extract job details for matching and notifications
  const { 
    job_title, 
    employerName, 
    employerId,
    region, 
    vehicleType, 
    job_type, 
    required_license_category 
  } = jobData;

  const jobLicenseCategory = Array.isArray(required_license_category) 
    ? required_license_category[0] 
    : required_license_category;

  try {
    // 1. Fetch all active job alerts
    const alertsSnapshot = await admin.firestore().collection("job_alerts")
      .where("status", "==", "active")
      .get();

    const notificationsToCreate: any[] = [];

    alertsSnapshot.docs.forEach((alertDoc) => {
      const alertData = alertDoc.data();
      const filters = alertData.filters || {};
      const userId = alertData.userId;
      
      // Don't alert the employer who posted the job (if they somehow have an alert)
      if (userId === employerId) return;

      // 2. Matching Logic
      let isMatch = true;

      if (filters.vehicleType && filters.vehicleType !== "all" && filters.vehicleType !== vehicleType) {
        isMatch = false;
      }
      if (filters.licenseCategory && filters.licenseCategory !== "all" && filters.licenseCategory !== jobLicenseCategory) {
        isMatch = false;
      }
      if (filters.region && filters.region !== "all" && filters.region !== region) {
        isMatch = false;
      }
      if (filters.jobType && filters.jobType !== "all" && filters.jobType !== job_type) {
        isMatch = false;
      }

      if (isMatch) {
        const { email, sms, system } = alertData.notifications || { email: true, sms: false, system: true };
        
        const metadata = {
          jobId,
          region: region || "Unspecified",
          vehicleType: vehicleType || "Unspecified",
        };

        // Standard System Notification
        if (system) {
          notificationsToCreate.push({
            userId,
            type: "SYSTEM",
            title: `New Job Match: ${job_title || 'Driver Position'}`,
            message: `A new ${vehicleType || 'driver'} role at ${employerName || 'a company'} matches your alert preferences.`,
            status: "PENDING",
            metadata,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // Email Notification
        if (email) {
          notificationsToCreate.push({
            userId,
            type: "EMAIL",
            title: `New Job Match: ${job_title || 'Driver Position'}`,
            message: `A new job matching your alert preferences has been posted on Dereva Kiganjani! \n\nLog in to your account to view the full details and apply.`,
            status: "PENDING",
            metadata: {
              ...metadata,
              company: employerName || 'Unspecified',
              title: job_title || 'Unspecified'
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // SMS Notification
        if (sms) {
          notificationsToCreate.push({
            userId,
            type: "SMS",
            message: `Dereva Kiganjani: New Job Match! ${job_title || 'Job'} at ${employerName || 'a company'} in ${region || 'your area'}. Log in to view!`,
            status: "PENDING",
            metadata,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    });

    // 3. Batch write notifications
    if (notificationsToCreate.length > 0) {
      const db = admin.firestore();
      // Firestore batch has a limit of 500 operations, handle in chunks if necessary
      const chunks = [];
      for (let i = 0; i < notificationsToCreate.length; i += 500) {
        chunks.push(notificationsToCreate.slice(i, i + 500));
      }

      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((notif) => {
          const newNotifRef = db.collection("notifications").doc();
          batch.set(newNotifRef, notif);
        });
        await batch.commit();
      }

      logger.info(`Successfully created ${notificationsToCreate.length} notification(s) for job ${jobId}`);
    } else {
      logger.info(`No active job alerts matched the new job ${jobId}`);
    }

  } catch (error) {
    logger.error(`Error processing job alerts for new job ${jobId}:`, error);
  }
});
