
import * as admin from "firebase-admin";

admin.initializeApp();

// Import and re-export all functions from their respective files

// Aggregations
export * from "./aggregations/counters.js";

// Auth
export * from "./auth/customClaims.js";
export * from "./auth/resetPassword.js";

// Notifications
export * from "./notifications/email.js";
export * from "./notifications/triggers.js";

// Payments
export * from "./payments/selcom.js";

// Storage
export * from "./storage/imageProcessing.js";
