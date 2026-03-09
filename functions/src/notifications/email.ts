
import * as nodemailer from 'nodemailer';

// --- IMPORTANT: CONFIGURE YOUR EMAIL SERVICE --- //
// This file reads environment variables.
// You must set these in your Firebase environment, e.g., using the Firebase CLI:
// firebase functions:config:set mail.host="..." mail.port="..." etc. (for older setups)
// or for Gen2, set them as params or in .env files.

const mailConfig = {
  host: process.env.MAIL_HOST || 'YOUR_SMTP_HOST',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: (process.env.MAIL_SECURE === 'true') || false,
  auth: {
    user: process.env.MAIL_USER || 'YOUR_SMTP_USER',
    pass: process.env.MAIL_PASS || 'YOUR_SMTP_PASSWORD',
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
    from: `"Dereva Huduma" <${process.env.MAIL_FROM || 'noreply@your-app.com'}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // Throw a standard error, the calling function will be responsible for the user-facing error.
    throw new Error('Failed to send email.');
  }
};
