
import * as admin from "firebase-admin";

admin.initializeApp();

// We will only export the functions necessary for the Selcom payment flow.

// Payments
export * from "./payments/selcom";
