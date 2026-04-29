
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Sends a notification to a user and a push notification via FCM.
 * @param {string} userId The ID of the user to notify.
 * @param {object} notification The notification payload.
 */
const sendNotification = async (userId: string, notification: any) => {
  // Save the notification to Firestore
  const notificationRef = db.collection('notifications');
  await notificationRef.add({
    ...notification,
    userId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false, // Mark as unread by default
  });

  // Send a push notification
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (userData && userData.fcmTokens && userData.fcmTokens.length > 0) {
    const payload = {
      notification: {
        title: 'You have a new notification',
        body: notification.message,
      },
      data: {
        link: notification.link || '',
      },
    };

    try {
      const message = {
        ...payload,
        tokens: userData.fcmTokens,
      };
      await admin.messaging().sendEachForMulticast(message);
      console.log('Push notification sent successfully.');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
};

/**
 * Triggered when a license application's status is updated.
 * Sends a notification to the user who submitted the application.
 */
export const onLicenseStatusChange = functions.firestore
  .document("license_applications/{appId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if the status has changed to 'Approved' or 'Rejected'
    if (before.status === after.status) {
      return;
    }

    if (after.status === 'Approved' || after.status === 'Rejected') {
      const userId = after.user;
      const message = `Your license application #${change.after.id.substring(0, 5)} has been ${after.status.toLowerCase()}.`;

      const notification = {
        type: 'license',
        title_en: 'License Application Update',
        title_sw: 'Taarifa ya Maombi ya Leseni',
        message: message, // Used for push notification fallback
        message_en: message,
        message_sw: `Maombi yako ya leseni #${change.after.id.substring(0, 5)} yamekuwa ${after.status.toLowerCase() === 'approved' ? 'yameidhinishwa' : 'yamekataliwa'}.`,
        link: `/license/application/${change.after.id}`,
      };

      console.log(`Sending notification to user ${userId} for license ${change.after.id}`);
      await sendNotification(userId, notification);
    }
  });

/**
 * Triggered when a new job is posted.
 */
export const onNewJobPosted = functions.firestore
  .document("jobs/{jobId}")
  .onCreate(async (snapshot, context) => {
    const jobData = snapshot.data();

    // This is where you'd implement the logic to find relevant drivers to notify.
    console.log(`New job posted: ${jobData.title}. Not sending notifications yet.`);
  });
