
import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Sends a notification to a user.
 * @param {string} userId The ID of the user to notify.
 * @param {object} notification The notification payload.
 */
const sendNotification = async (userId: string, notification: object) => {
  const notificationRef = db.collection('users').doc(userId).collection('notifications');
  return notificationRef.add({
    ...notification,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    read: false, // Mark as unread by default
  });
};

/**
 * Triggered when a license application's status is updated.
 * Sends a notification to the user who submitted the application.
 */
export const onLicenseStatusChange = onDocumentUpdated("license_applications/{appId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  if (!before || !after) {
    console.log("No data associated with the event");
    return;
  }

  // Check if the status has changed to 'Approved' or 'Rejected'
  if (before.status === after.status) {
    return;
  }

  if (after.status === 'Approved' || after.status === 'Rejected') {
    const userId = after.user;
    const message = `Your license application #${event.data?.after.id.substring(0, 5)} has been ${after.status.toLowerCase()}.`;

    const notification = {
      type: 'LICENSE_STATUS',
      message: message,
      link: `/license/application/${event.data?.after.id}`,
    };

    console.log(`Sending notification to user ${userId} for license ${event.data?.after.id}`);
    await sendNotification(userId, notification);
  }
});

/**
 * Triggered when a new job is posted.
 * This is a placeholder. You might want to notify all drivers in a certain region, for example.
 * For now, it does not send a notification but demonstrates the structure.
 */
export const onNewJobPosted = onDocumentCreated("jobs/{jobId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const jobData = snapshot.data();

  // This is where you'd implement the logic to find relevant drivers to notify.
  // For example, query for drivers in the job's region.
  console.log(`New job posted: ${jobData.title}. Not sending notifications yet.`);

  // Example: 
  // const drivers = await db.collection('users').where('roles', 'array-contains', 'Driver').get();
  // drivers.forEach(driver => {
  //   const notification = { ... };
  //   sendNotification(driver.id, notification);
  // });
});
