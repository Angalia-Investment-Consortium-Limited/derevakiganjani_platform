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
exports.setCustomUserRole = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
    admin.initializeApp();
}
/**
 * Cloud Function to set a custom user claim (role) when a new user document is created in Firestore.
 * This is triggered whenever a document is added to the 'users' collection.
 */
exports.setCustomUserRole = (0, firestore_1.onDocumentCreated)("users/{userId}", async (event) => {
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
    }
    catch (error) {
        console.error(`Error setting custom claim for user ${userId}:`, error);
    }
});
//# sourceMappingURL=customClaims.js.map