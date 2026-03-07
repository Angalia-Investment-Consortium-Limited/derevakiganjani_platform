
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Callable Cloud Function to set a custom user claim (role).
 */
export const setCustomUserRole = functions.https.onCall(async (data, context) => {
  // Ensure the user calling the function is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called by an authenticated user.'
    );
  }

  // Optional: You might want to add a check here to ensure the caller is an admin.
  // For example:
  // if (context.auth.token.role !== 'admin') {
  //   throw new functions.https.HttpsError(
  //     'permission-denied',
  //     'Only admins can set custom user roles.'
  //   );
  // }

  const { userId, role } = data;

  if (!userId || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with "userId" and "role" arguments.'
    );
  }

  try {
    console.log(`Setting custom claim for user ${userId}. New role: '${role}'.`);
    await admin.auth().setCustomUserClaims(userId, { role: role });
    console.log(`Custom claim '${role}' set for user ${userId}`);
    return { result: `Successfully set role to ${role} for user ${userId}.` };
  } catch (error) {
    console.error(`Error setting custom claim for user ${userId}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'An internal error occurred while setting the custom claim.'
    );
  }
});
