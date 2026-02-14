
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

const db = admin.firestore();

const beemApiKey = functions.config().beem.apikey;
const beemApiSecret = functions.config().beem.apisecret;
const beemBaseUrl = "https://apisms.beem.africa/v1/send";

export const requestOTP = functions.https.onCall(async (data, context) => {
  const { mobile_no } = data;
  const pinId = Math.random().toString(36).substring(2, 10);
  const pin = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await db.collection("otps").doc(pinId).set({
      mobile_no,
      pin,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const message = `Your verification code is ${pin}`;

    await axios.post(beemBaseUrl, {
      "source_addr": "DEREVA",
      "encoding": 0,
      "message": message,
      "to": [mobile_no],
    }, {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${beemApiKey}:${beemApiSecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    return { success: true, pinId };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new functions.https.HttpsError("internal", "Failed to send OTP");
  }
});

export const verifyOTP = functions.https.onCall(async (data, context) => {
  const { pinId, pin } = data;

  try {
    const otpDoc = await db.collection("otps").doc(pinId).get();

    if (!otpDoc.exists) {
      throw new functions.https.HttpsError("not-found", "OTP not found");
    }

    const otpData = otpDoc.data();

    if (otpData?.pin !== pin) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
    }

    if (otpData?.verified) {
      throw new functions.https.HttpsError("already-exists", "OTP already verified");
    }

    await db.collection("otps").doc(pinId).update({ verified: true });

    return { success: true };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to verify OTP");
  }
});

export { resetPassword } from "./auth/resetPassword";
