
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Function to increment a counter when a new job application is created.
 */
export const incrementJobApplicationCount = onDocumentCreated("applications/{applicationId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const applicationData = snapshot.data();

  if (!applicationData || !applicationData.jobId) {
    console.error("Missing job ID in application data");
    return;
  }

  const jobId = applicationData.jobId;
  const jobRef = db.collection("jobs").doc(jobId);

  try {
    // Use a transaction to safely increment the counter
    await db.runTransaction(async (transaction) => {
      const jobDoc = await transaction.get(jobRef);
      if (!jobDoc.exists) {
        throw `Job ${jobId} not found!`;
      }

      const currentCount = jobDoc.data()?.application_count || 0;
      transaction.update(jobRef, { application_count: currentCount + 1 });
    });

    console.log(`Incremented application count for job ${jobId}`);

  } catch (error) {
    console.error(`Error incrementing application count for job ${jobId}:`, error);
  }
});

/**
 * Cloud Function to decrement a counter when a job application is deleted.
 * This is important to keep the counts accurate.
 */
export const decrementJobApplicationCount = onDocumentDeleted("applications/{applicationId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const applicationData = snapshot.data();

  if (!applicationData || !applicationData.jobId) {
    console.error("Missing job ID in deleted application data");
    return;
  }

  const jobId = applicationData.jobId;
  const jobRef = db.collection("jobs").doc(jobId);

  try {
    await db.runTransaction(async (transaction) => {
      const jobDoc = await transaction.get(jobRef);
      if (!jobDoc.exists) {
        console.warn(`Job ${jobId} not found for decrementing count.`);
        return;
      }

      const currentCount = jobDoc.data()?.application_count || 0;
      // Ensure the count doesn't go below zero
      const newCount = Math.max(0, currentCount - 1);
      transaction.update(jobRef, { application_count: newCount });
    });

    console.log(`Decremented application count for job ${jobId}`);

  } catch (error) {
    console.error(`Error decrementing application count for job ${jobId}:`, error);
  }
});
