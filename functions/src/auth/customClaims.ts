
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function to set a custom user claim (role) when a user document is created or updated in Firestore.
 * This is triggered whenever a document is written to the 'users' collection.
 */
export const setCustomUserRole = onDocumentWritten("users/{userId}", async (event) => {
  const after = event.data?.after;
  const userId = event.params.userId;

  // If document is deleted or has no data, we can't set a claim.
  if (!after || !after.exists) {
    console.log(`User document for ${userId} deleted. Removing custom claim.`);
    // Remove the custom claim on deletion
    try {
        const { customClaims } = await admin.auth().getUser(userId);
        if (customClaims && customClaims.role) {
            await admin.auth().setCustomUserClaims(userId, { role: null });
        }
    } catch (error) {
        console.error(`Error removing custom claim for user ${userId}:`, error);
    }
    return;
  }
  
  const userData = after.data();

  // Exit if user data is missing
  if (!userData) {
    console.log(`User data is missing for user ${userId}.`);
    return;
  }

  const primaryRole = (userData.roles && userData.roles.length > 0) ? userData.roles[0] : null;

  try {
    const { customClaims } = await admin.auth().getUser(userId);

    // Only set the claim if it's different from the current one to avoid redundant updates.
    if (customClaims && customClaims.role === primaryRole) {
      console.log(`User ${userId} already has correct claim: '${primaryRole}'. No update needed.`);
      return;
    }
    
    console.log(`Updating custom claim for ${userId}. New role: '${primaryRole}'.`);
    // Set the custom claim on the user's authentication token
    await admin.auth().setCustomUserClaims(userId, { role: primaryRole });
    console.log(`Custom claim '${primaryRole}' set for user ${userId}`);
    
    // Update the document to reflect that the claim has been set.
    await after.ref.update({ customClaimSet: true });

  } catch (error) {
    console.error(`Error setting custom claim for user ${userId}:`, error);
  }
});
