import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { logger } from "firebase-functions";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Configure Nodemailer SMTP Transporter
 * Using the same secure parameters as onNotificationCreated
 */
const transporter = nodemailer.createTransport({
  host: "mail.mdvfleet.co.tz",
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: "communicaton@mdvfleet.co.tz",
    pass: "Yeshua@2026",
  },
});

/**
 * Scheduled Cloud Function that runs every day at 8:00 PM EAT
 * It aggregates platform statistics from the last 24 hours and emails them to the admin.
 */
export const generateAdminDigest = onSchedule({
  schedule: "0 20 * * *", // 20:00 (8:00 PM) daily
  timeZone: "Africa/Dar_es_Salaam",
  timeoutSeconds: 300, 
}, async (event) => {
  const db = admin.firestore();
  
  // Calculate the timestamp for 24 hours ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const firestorePrevTimestamp = admin.firestore.Timestamp.fromDate(twentyFourHoursAgo);

  logger.info(`Starting daily admin digest generation from ${twentyFourHoursAgo.toISOString()}...`);

  try {
    // 1. Fetch New Employers
    const employersQuery = await db.collection("employer_profiles")
        .where("account_creation_date", ">=", firestorePrevTimestamp)
        .get();
    const newEmployersCount = employersQuery.size;

    // 2. Fetch New Drivers
    const driversQuery = await db.collection("driver_profiles")
        .where("createdAt", ">=", firestorePrevTimestamp)
        .get();
    const newDriversCount = driversQuery.size;

    // 3. Fetch New License Applications
    const licensesQuery = await db.collection("license_applications")
        .where("submittedOn", ">=", firestorePrevTimestamp)
        .get();
    const newLicensesCount = licensesQuery.size;

    // 4. Fetch Support Tickets
    const supportQuery = await db.collection("support_requests")
        .where("createdAt", ">=", firestorePrevTimestamp)
        .get();
    const newSupportTickets = supportQuery.size;

    // 5. Fetch Job Posts
    const jobsQuery = await db.collection("jobs")
        .where("posted_date", ">=", firestorePrevTimestamp)
        .get();
    const newJobPosts = jobsQuery.size;

    // 6. Calculate Completed Payments Revenue
    const paymentsQuery = await db.collection("payments")
        .where("createdAt", ">=", firestorePrevTimestamp)
        .where("status", "==", "completed")
        .get();
    let totalRevenue = 0;
    paymentsQuery.forEach(doc => {
       const amount = doc.data().amount || 0;
       totalRevenue += Number(amount);
    });

    // 7. Fetch Failed Notifications / Errors
    const errorsQuery = await db.collection("notifications")
        .where("createdAt", ">=", firestorePrevTimestamp)
        .where("status", "==", "FAILED")
        .get();
    const systemErrorsCount = errorsQuery.size;

    const totalMetrics = newEmployersCount + newDriversCount + newLicensesCount + newSupportTickets + newJobPosts + totalRevenue + systemErrorsCount;
    const isQuietDay = totalMetrics === 0;

    // 8. Format the HTML Email Structure
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-w-xl; color: #333; line-height: 1.6;">
        <h2 style="color: #0b2241;">Dereva Kiganjani - Daily Administrator Digest</h2>
        <p>Here is a summary of the activity on the platform over the last 24 hours.</p>
        
        ${isQuietDay ? 
            '<div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;"><strong>Notice:</strong> The system experienced zero active engagements or errors in the past 24 hours.</div>' 
            : ''
        }

        <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f4f6f9; text-align: left;">
            <th style="padding: 12px; border-bottom: 2px solid #ddd;">Metric</th>
            <th style="padding: 12px; border-bottom: 2px solid #ddd;">Value (+24h)</th>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>💰 Total Revenue Completed</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">TZS ${totalRevenue.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>🏢 New Employer Registrations</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${newEmployersCount}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>🚘 New Driver Profiles</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${newDriversCount}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>🪪 License Applications Submitted</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${newLicensesCount}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>💼 New Job Posts Created</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${newJobPosts}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>🎫 Support Tickets Opened</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${newSupportTickets}</td>
          </tr>
          <tr style="${systemErrorsCount > 0 ? 'background-color: #fff3f3;' : ''}">
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: ${systemErrorsCount > 0 ? '#cc0000' : '#333'}"><strong>⚠️ System/Delivery Errors</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: ${systemErrorsCount > 0 ? '#cc0000' : '#333'}"><strong>${systemErrorsCount}</strong></td>
          </tr>
        </table>
        
        <p style="margin-top: 30px; font-size: 14px; color: #777;">
            Log in to the Admin Portal to review detailed metrics and respond to pending requests.
        </p>
      </div>
    `;

    // 9. Dispatch Email
    await transporter.sendMail({
      from: '"Dereva Kiganjani Digest" <communicaton@mdvfleet.co.tz>',
      to: ["david@mdvfleet.co.tz", "mdv@aicl.co.tz"], 
      subject: `Daily Admin Digest - ${new Date().toLocaleDateString()}`,
      html: emailHtml,
    });

    logger.info("Daily Admin Digest generated and emailed successfully.");

  } catch (error: any) {
    logger.error("Failed to generate and send Admin Digest:", error);
  }
});
