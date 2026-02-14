"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementJobApplicationCount = exports.incrementJobApplicationCount = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Cloud Function to increment a counter when a new job application is created.
 */
exports.incrementJobApplicationCount = (0, firestore_1.onDocumentCreated)("applications/{applicationId}", async (event) => {
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
            var _a;
            const jobDoc = await transaction.get(jobRef);
            if (!jobDoc.exists) {
                throw `Job ${jobId} not found!`;
            }
            const currentCount = ((_a = jobDoc.data()) === null || _a === void 0 ? void 0 : _a.application_count) || 0;
            transaction.update(jobRef, { application_count: currentCount + 1 });
        });
        console.log(`Incremented application count for job ${jobId}`);
    }
    catch (error) {
        console.error(`Error incrementing application count for job ${jobId}:`, error);
    }
});
/**
 * Cloud Function to decrement a counter when a job application is deleted.
 * This is important to keep the counts accurate.
 */
exports.decrementJobApplicationCount = (0, firestore_1.onDocumentDeleted)("applications/{applicationId}", async (event) => {
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
            var _a;
            const jobDoc = await transaction.get(jobRef);
            if (!jobDoc.exists) {
                console.warn(`Job ${jobId} not found for decrementing count.`);
                return;
            }
            const currentCount = ((_a = jobDoc.data()) === null || _a === void 0 ? void 0 : _a.application_count) || 0;
            // Ensure the count doesn't go below zero
            const newCount = Math.max(0, currentCount - 1);
            transaction.update(jobRef, { application_count: newCount });
        });
        console.log(`Decremented application count for job ${jobId}`);
    }
    catch (error) {
        console.error(`Error decrementing application count for job ${jobId}:`, error);
    }
});
//# sourceMappingURL=counters.js.map