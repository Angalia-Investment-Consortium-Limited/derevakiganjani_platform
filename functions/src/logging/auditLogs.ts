import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Ensure admin is initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

// Helper to calculate exact field changes for updates
function getChanges(before: admin.firestore.DocumentData, after: admin.firestore.DocumentData) {
    const changes: Record<string, any> = {};
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    
    allKeys.forEach(key => {
        // Simple distinct check for stringification
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
            changes[key] = {
                old: before[key] !== undefined ? before[key] : null,
                new: after[key] !== undefined ? after[key] : null
            };
        }
    });
    return changes;
}

/**
 * 1. Firebase Auth Triggers (Authentication layer)
 */
export const onUserAuthCreate = functions.auth.user().onCreate(async (user) => {
    return db.collection("audit_logs").add({
        action: "AUTH_USER_CREATE",
        targetId: user.uid,
        targetCollection: "auth",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
            email: user.email || null,
            displayName: user.displayName || null,
        }
    });
});

export const onUserAuthDelete = functions.auth.user().onDelete(async (user) => {
    return db.collection("audit_logs").add({
        action: "AUTH_USER_DELETE",
        targetId: user.uid,
        targetCollection: "auth",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
            email: user.email || null,
        }
    });
});

/**
 * 2. Generic Firestore Trigger Generator
 */
function createFirestoreTrigger(collectionName: string) {
    return functions.firestore.document(`${collectionName}/{docId}`).onWrite(async (change, context) => {
        const { docId } = context.params;
        const before = change.before.data();
        const after = change.after.data();
        
        let actionStr = "";
        let details = {};

        if (!before && after) {
            actionStr = `${collectionName.toUpperCase()}_CREATE`;
        } else if (before && !after) {
            actionStr = `${collectionName.toUpperCase()}_DELETE`;
        } else if (before && after) {
            actionStr = `${collectionName.toUpperCase()}_UPDATE`;
            
            const diff = getChanges(before, after);
            
            // Skip logging if nothing substantial actually changed
            if (Object.keys(diff).length === 0) return null; 
            
            details = { changes: diff };
        } else {
            return null; // Should never happen logically
        }

        return db.collection("audit_logs").add({
            action: actionStr,
            targetId: docId,
            targetCollection: collectionName,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: details
        });
    });
}

/**
 * 3. Export Firestore Triggers for highly-sensitive collections
 */
export const users = createFirestoreTrigger("users");
export const jobs = createFirestoreTrigger("jobs");
export const licenseApplications = createFirestoreTrigger("license_applications");
export const employers = createFirestoreTrigger("employers");
export const payments = createFirestoreTrigger("payments");
export const admins = createFirestoreTrigger("admins");
