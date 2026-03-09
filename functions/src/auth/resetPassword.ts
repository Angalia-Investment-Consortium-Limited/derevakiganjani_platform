
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

export const resetPassword = onCall(async (request) => {
    const { mobile_no, pinId, pin, newPassword } = request.data;

    if (!mobile_no || !pinId || !pin || !newPassword) {
        throw new HttpsError(
            "invalid-argument",
            "Missing required fields (mobile_no, pinId, pin, newPassword)"
        );
    }

    try {
        const otpDocRef = db.collection("otps").doc(pinId);
        const otpDoc = await otpDocRef.get();

        if (!otpDoc.exists) {
            throw new HttpsError("not-found", "OTP not found or has expired. Please request a new one.");
        }

        const otpData = otpDoc.data();

        if (otpData?.pin !== pin) {
            throw new HttpsError("invalid-argument", "The OTP code is invalid.");
        }

        if (otpData?.verified) {
            throw new HttpsError("already-exists", "This OTP has already been used. Please request a new one.");
        }
        
        if (otpData?.mobile_no !== mobile_no) {
            throw new HttpsError("invalid-argument", "This OTP is not for this phone number.");
        }

        // Find user by phone number
        const userRecord = await admin.auth().getUserByPhoneNumber(mobile_no);

        // Update user's password in Firebase Auth
        await admin.auth().updateUser(userRecord.uid, {
            password: newPassword
        });

        // Mark OTP as verified to prevent reuse
        await otpDocRef.update({ verified: true });

        return { success: true, message: "Password has been reset successfully." };
    } catch (error) {
        console.error("Error resetting password:", error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError(
            "internal",
            "An unexpected error occurred while resetting the password. Please try again."
        );
    }
});
