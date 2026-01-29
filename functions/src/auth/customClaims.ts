
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function to set a custom user claim (role) when a new user document is created in Firestore.
 * This is triggered whenever a document is added to the 'users' collection.
 */
export const setCustomUserRole = onDocumentCreated("users/{userId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  
  const userId = event.params.userId;
  const userData = snapshot.data();

  // Exit if user data or roles are missing
  if (!userData || !userData.roles || userData.roles.length === 0) {
    console.log(`No role to set for user ${userId}.`);
    return;
  }

  // Get the primary role from the 'roles' array
  const primaryRole = userData.roles[0];

  try {
    // Set the custom claim on the user's authentication token
    await admin.auth().setCustomUserClaims(userId, { role: primaryRole });
    console.log(`Custom claim '${primaryRole}' set for user ${userId}`);
    
    // You can optionally add a log or an update to the user document itself
    await snapshot.ref.update({ customClaimSet: true });

  } catch (error) {
    console.error(`Error setting custom claim for user ${userId}:`, error);
  }
});
