import * as admin from "firebase-admin";

admin.initializeApp();

// Export all functions from the 'callable' directory
export * from "./callable/requestLicense";
export * from "./callable/requestVerification";

// Export all functions from the 'firestore' directory
export * from "./firestore/onLicenseApplicationUpdate";
export * from "./firestore/onEmployerVerificationUpdate";
