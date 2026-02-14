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
exports.onNewJobPosted = exports.onLicenseStatusChange = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
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
const sendNotification = async (userId, notification) => {
    const notificationRef = db.collection('users').doc(userId).collection('notifications');
    return notificationRef.add(Object.assign(Object.assign({}, notification), { timestamp: admin.firestore.FieldValue.serverTimestamp(), read: false }));
};
/**
 * Triggered when a license application's status is updated.
 * Sends a notification to the user who submitted the application.
 */
exports.onLicenseStatusChange = (0, firestore_1.onDocumentUpdated)("license_applications/{appId}", async (event) => {
    var _a, _b, _c, _d, _e;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
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
        const message = `Your license application #${(_c = event.data) === null || _c === void 0 ? void 0 : _c.after.id.substring(0, 5)} has been ${after.status.toLowerCase()}.`;
        const notification = {
            type: 'LICENSE_STATUS',
            message: message,
            link: `/license/application/${(_d = event.data) === null || _d === void 0 ? void 0 : _d.after.id}`,
        };
        console.log(`Sending notification to user ${userId} for license ${(_e = event.data) === null || _e === void 0 ? void 0 : _e.after.id}`);
        await sendNotification(userId, notification);
    }
});
/**
 * Triggered when a new job is posted.
 * This is a placeholder. You might want to notify all drivers in a certain region, for example.
 * For now, it does not send a notification but demonstrates the structure.
 */
exports.onNewJobPosted = (0, firestore_1.onDocumentCreated)("jobs/{jobId}", async (event) => {
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
//# sourceMappingURL=triggers.js.map