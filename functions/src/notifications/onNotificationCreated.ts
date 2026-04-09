import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import axios from "axios";
import { logger } from "firebase-functions";

// Initialise admin if not already initialised
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Configure Nodemailer SMTP Transporter
 */
const transporter = nodemailer.createTransport({
  host: "mail.mdvfleet.co.tz",
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: "communicaton@mdvfleet.co.tz", // Fixed typo here!
    pass: "Yeshua@2026",
  },
});

/**
 * Beem Africa Configuration
 */
const BEEM_API_KEY = "fe1fcc2c58d7d1bb";
const BEEM_SECRET_KEY = "NTc4OWRmMTkyNDEwMjQwMTMxNWIzNjcxY2UzNDc3OTFmNzdkYmRkMDE5NTcwMWE2Yzg5MmI4MzRiM2NmMWZkYg==";
const BEEM_SENDER_ID = "DerevaInfo";
const BEEM_URL = "https://apisms.beem.africa/v1/send";

/**
 * Cloud Function triggered on new document in `notifications`
 */
export const onNotificationCreated = onDocumentCreated("notifications/{notificationId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const notificationId = event.params.notificationId;
  const data = snapshot.data();
  // Destructure required fields
  const { type, message, emailAddress, phoneNumber, title, status } = data;

  // We only process if status is pending
  if (status !== "PENDING" && !data.createdAt) {
    // We already processed or it's incorrectly formatted
    return;
  }

  try {
    if (type === "SYSTEM") {
      // 1. Mark as sent instantly for in-app UI bell
      await snapshot.ref.update({ status: "SENT", updatedAt: admin.firestore.FieldValue.serverTimestamp() });

      // 2. Attempt to dispatch FCM web push notification
      if (data.userId) {
        try {
          const userSnap = await admin.firestore().collection("users").doc(data.userId).get();
          const fcmToken = userSnap.data()?.fcmToken;
          
          if (fcmToken) {
              await admin.messaging().send({
                  token: fcmToken,
                  notification: {
                      title: title || "Dereva Kiganjani",
                      body: message || "You have a new notification."
                  }
              });
              logger.info(`FCM Push sent successfully to user: ${data.userId}`);
          }
        } catch (e: any) {
          logger.warn(`FCM dispatch failed for user ${data.userId}: ${e.message}`);
        }
      }
      
      return;
    }

    if (type === "EMAIL") {
      let finalEmail = emailAddress;
      
      // Fetch Preferences & Email Fallback
      let emailEnabled = true;
      if (data.userId) {
         try {
             // 1. Try resolving email from root user
             const userDoc = await admin.firestore().collection("users").doc(data.userId).get();
             if (userDoc.exists) {
                 finalEmail = finalEmail || userDoc.data()?.email;
             }

             // 2. Resolve preferences & fallback profile emails
             const driverDoc = await admin.firestore().collection("driver_profiles").doc(data.userId).get();
             if (driverDoc.exists) {
                 const prefs = driverDoc.data()?.notificationPreferences;
                 if (prefs && prefs.emailEnabled === false) emailEnabled = false;
                 finalEmail = finalEmail || driverDoc.data()?.email;
             } else {
                 const empDoc = await admin.firestore().collection("employer_profiles").doc(data.userId).get();
                 if (empDoc.exists) {
                     const prefs = empDoc.data()?.notificationPreferences;
                     if (prefs && prefs.emailEnabled === false) emailEnabled = false;
                     finalEmail = finalEmail || empDoc.data()?.company_email;
                 }
             }
         } catch (e) {
             logger.warn("Could not fetch user preferences for Email", e);
         }
      }

      if (!finalEmail) {
        throw new Error("Email address is required and could not be resolved for EMAIL notifications.");
      }
      
      if (!emailEnabled) {
          logger.info(`Email dispatch skipped due to user preference: ${data.userId}`);
          await snapshot.ref.update({ status: "SKIPPED", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
          return;
      }

      await transporter.sendMail({
        from: '"Dereva Kiganjani" <communicaton@mdvfleet.co.tz>',
        to: finalEmail,
        subject: title || "New Notification - Dereva Kiganjani",
        text: message,
        html: `<p>${message}</p>`,
      });

      logger.info(`Email sent successfully to ${finalEmail} [ID: ${notificationId}]`);
      await snapshot.ref.update({ status: "SENT", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }

    if (type === "SMS") {
      let finalPhoneNumber = phoneNumber;

      // Fetch Preferences & Number
      let smsEnabled = true;
      if (data.userId) {
         try {
             const userDoc = await admin.firestore().collection("users").doc(data.userId).get();
             if (userDoc.exists) {
                 finalPhoneNumber = finalPhoneNumber || userDoc.data()?.mobile_no || userDoc.data()?.phoneNumber;
             }

             const driverDoc = await admin.firestore().collection("driver_profiles").doc(data.userId).get();
             if (driverDoc.exists) {
                 const prefs = driverDoc.data()?.notificationPreferences;
                 if (prefs && prefs.smsEnabled === false) smsEnabled = false;
                 finalPhoneNumber = finalPhoneNumber || driverDoc.data()?.phone_number;
             } else {
                 const empDoc = await admin.firestore().collection("employer_profiles").doc(data.userId).get();
                 if (empDoc.exists) {
                     const prefs = empDoc.data()?.notificationPreferences;
                     if (prefs && prefs.smsEnabled === false) smsEnabled = false;
                     finalPhoneNumber = finalPhoneNumber || empDoc.data()?.company_phone;
                 }
             }
         } catch (e) {
             logger.warn("Could not fetch user preferences for SMS", e);
         }
      }

      if (!finalPhoneNumber) {
        throw new Error("Phone number is required and could not be resolved for SMS notifications.");
      }

      if (!smsEnabled) {
          logger.info(`SMS dispatch skipped due to user preference: ${data.userId}`);
          await snapshot.ref.update({ status: "SKIPPED", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
          return;
      }

      let fmtPhone = finalPhoneNumber.trim();
      if (fmtPhone.startsWith("+")) {
          fmtPhone = fmtPhone.substring(1);
      } else if (fmtPhone.startsWith("0")) {
          fmtPhone = "255" + fmtPhone.substring(1);
      }

      // Format recipient specifically for Beem Africa
      const recipient = {
        recipient_id: 1,
        // Beem requires valid international format without '+'
        dest_addr: fmtPhone,
      };

      const authHeader = "Basic " + Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString("base64");

      const response = await axios.post(
        BEEM_URL,
        {
          source_addr: BEEM_SENDER_ID,
          schedule_time: "",
          encoding: 0,
          message: message,
          recipients: [recipient],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          httpsAgent: new (require("https")).Agent({ rejectUnauthorized: false })
        }
      );

      if (response.data && response.data.successful) {
        logger.info(`SMS sent successfully to ${finalPhoneNumber} [ID: ${notificationId}]`);
        await snapshot.ref.update({ status: "SENT", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        throw new Error(`SMS Provider error: ${JSON.stringify(response.data)}`);
      }
      return;
    }

    // Unrecognized type
    logger.warn(`Unrecognized notification type: ${type} for ID: ${notificationId}`);
    await snapshot.ref.update({ 
      status: "FAILED", 
      error: "Unrecognized notification type", 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });

  } catch (error: any) {
    logger.error(`Error processing notification ${notificationId}:`, error);
    await snapshot.ref.update({ 
      status: "FAILED", 
      deliveryStatus: "FAILED",
      deliveryError: error.message || "Unknown error",
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
  }
});
