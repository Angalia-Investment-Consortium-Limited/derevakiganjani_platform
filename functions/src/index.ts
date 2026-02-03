
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

import { setCustomUserRole } from './auth/customClaims';
import { onLicenseStatusChange, onNewJobPosted } from './notifications/triggers';
import { incrementJobApplicationCount, decrementJobApplicationCount } from './aggregations/counters';
import { generateThumbnail } from './storage/imageProcessing';

const BEEM_API_KEY = "c66294ad417339ee";
const BEEM_SECRET_KEY = "ZDlhYTA2MDFkOGI2ZjU5ODNmNmY1ZDgzZmQyZDVmODhiZTVkMGYzMGI0NDdjZDA0M2ZjZWYyNzM2NTc5ZTIwMQ==";
const BEEM_APP_ID = "3755";
const BEEM_BASE_URL = "https://apiotp.beem.africa/v1";

// Export all the functions for deployment
export {
  setCustomUserRole,
  onLicenseStatusChange,
  onNewJobPosted,
  incrementJobApplicationCount,
  decrementJobApplicationCount,
  generateThumbnail,
};

export const getDashboardStats = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated and is an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated admin user."
    );
  }

  const db = admin.firestore();

  try {
    const driversSnapshot = await db.collection("users").where("roles", "array-contains", "Driver").get();
    const employersSnapshot = await db.collection("users").where("roles", "array-contains", "Employer").get();
    const pendingLicensesSnapshot = await db.collection("license_applications").where("status", "==", "Pending").get();
    const activeCoursesSnapshot = await db.collection("courses").get();
    const activeJobPostsSnapshot = await db.collection("job_posts").get();

    const stats = {
      total_drivers: driversSnapshot.size,
      total_employers: employersSnapshot.size,
      pending_license_requests: pendingLicensesSnapshot.size,
      active_courses: activeCoursesSnapshot.size,
      active_job_posts: activeJobPostsSnapshot.size,
    };

    return { data: stats };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to fetch dashboard statistics."
    );
  }
});

export const requestOTP = functions.https.onCall(async (data, context) => {
  const { mobile_no } = data;
  const db = admin.firestore();

  try {
    const response = await axios.post(
      `${BEEM_BASE_URL}/request`,
      {
        appId: BEEM_APP_ID,
        msisdn: mobile_no,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString("base64")}`,
        },
      }
    );

    const { pinId } = response.data.data;

    await db.collection("otp_requests").add({ mobile_no, pinId, createdAt: new Date() });

    return { success: true, pinId };
  } catch (error) {
    console.error("Error requesting OTP:", error);
    throw new functions.https.HttpsError("internal", "Unable to request OTP.");
  }
});

export const verifyOTP = functions.https.onCall(async (data, context) => {
  const { pinId, pin } = data;
  const db = admin.firestore();

  try {
    const response = await axios.post(
      `${BEEM_BASE_URL}/verify`,
      {
        pinId,
        pin,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString("base64")}`,
        },
      }
    );

    if (response.data.data.message.code === 117) {
      await db.collection("otp_requests").where("pinId", "==", pinId).delete();
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new functions.https.HttpsError("internal", "Unable to verify OTP.");
  }
});
