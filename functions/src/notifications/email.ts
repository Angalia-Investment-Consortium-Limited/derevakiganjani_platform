
import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';

// --- IMPORTANT: CONFIGURE YOUR EMAIL SERVICE --- //
// This file reads the configuration set by the Firebase CLI.
// firebase functions:config:set mail.host="..." mail.port="..." etc.
// DO NOT HARDCODE YOUR PASSWORD HERE.

const mailConfig = {
  host: functions.config().mail?.host || 'YOUR_SMTP_HOST',       
  port: parseInt(functions.config().mail?.port || '587', 10), 
  secure: (functions.config().mail?.secure === 'true') || false, 
  auth: {
    user: functions.config().mail?.user || 'YOUR_SMTP_USER',       
    pass: functions.config().mail?.pass || 'YOUR_SMTP_PASSWORD',   
  },
};

const transporter = nodemailer.createTransport(mailConfig);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the pre-configured transporter.
 * @param {EmailOptions} options The email options.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  const mailOptions = {
    from: `"Dereva Huduma" <${functions.config().mail?.from || 'noreply@your-app.com'}>`, // This uses the 'from' email set in the config
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to send email.');
  }
};
