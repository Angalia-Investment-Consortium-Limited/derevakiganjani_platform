const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");
const sharp = require("sharp");

admin.initializeApp();
const db = admin.firestore();

// PREVIOUSLY EXISTING FUNCTIONS //

exports.onboardNewUser = functions.auth.user().onCreate(async (user) => {
  functions.logger.info(`New user signed up: ${user.uid}`, { uid: user.uid });
  const roleRef = db.collection('user_roles').doc(user.uid);
  const roleDoc = await roleRef.get();
  if (!roleDoc.exists) {
    functions.logger.error('User role not found for user:', user.uid);
    const driverProfile = {
        driverId: user.uid,
        fullName: user.displayName || "New Driver",
        bio: "",
        skills: [],
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('driver_profiles').doc(user.uid).set(driverProfile);
    return;
  }
  const { role } = roleDoc.data();
  if (role === 'employer') {
    const employerProfile = {
      userId: user.uid,
      company_email: user.email,
      company_name: "New Company",
      verificationStatus: "Pending",
      account_creation_date: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('employers').doc(user.uid).set(employerProfile);
    functions.logger.info(`Created PENDING employer profile for ${user.uid}`);
  } else {
    const driverProfile = {
      driverId: user.uid,
      fullName: user.displayName || "New Driver",
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('driver_profiles').doc(user.uid).set(driverProfile);
    functions.logger.info(`Created driver profile for ${user.uid}`);
  }
  await roleRef.delete();
});

exports.verifyEmployer = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const adminRef = db.collection('admins').doc(context.auth.uid);
  const adminDoc = await adminRef.get();
  if (!adminDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can verify employers.');
  }
  const employerId = data.employerId;
  if (!employerId) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with an "employerId".');
  }
  const employerRef = db.collection('employers').doc(employerId);
  await employerRef.update({ verificationStatus: "Verified" });
  functions.logger.info(`Employer ${employerId} verified by admin ${context.auth.uid}`);
  return { success: true, message: `Employer ${employerId} has been verified.` };
});

exports.generateCertificateOnCourseCompletion = functions.firestore
  .document('course_enrollments/{enrollmentId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    if (newData.status === 'Completed' && oldData.status !== 'Completed') {
      const { courseId, driverId, course_name } = newData;
      const certificate = {
        driverId: driverId,
        courseId: courseId,
        courseName: course_name || "Course",
        issueDate: admin.firestore.FieldValue.serverTimestamp(),
        certificateUid: `CERT-${Date.now()}-${driverId.substring(0, 4)}`
      };
      await db.collection('certificates').add(certificate);
      functions.logger.info(`Certificate generated for driver ${driverId} for course ${courseId}`);
    }
    return null;
});

exports.notifyOnApplicationStatusChange = functions.firestore
    .document('job_applications/{appId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        // Check if the status has actually changed
        if (newData.status !== oldData.status) {
            const { driverId, jobId, status } = newData;

            if (!driverId || !jobId) {
                functions.logger.error("Missing driverId or jobId in application update", context.params.appId);
                return null;
            }

            // Get the job title for a more descriptive notification
            const jobRef = db.collection('jobs').doc(jobId);
            const jobDoc = await jobRef.get();
            const jobTitle = jobDoc.exists ? jobDoc.data().title : 'a job';

            const notification = {
                type: 'JOB_APPLICATION_STATUS',
                title: `Application for ${jobTitle}`,
                message: `Your application status for the job "${jobTitle}" has been updated to: ${status}.`,
                userId: driverId,
                relatedDocId: context.params.appId, // Link to the application document
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Create the notification in the user's subcollection
            await db.collection('users').doc(driverId).collection('notifications').add(notification);
            functions.logger.info(`Notification sent to driver ${driverId} for job application ${context.params.appId}`);
        }
        return null;
    });

// --- RESTORED FUNCTIONS --- //

/**
 * 5. Set Custom User Role (Most Secure Method)
 * 
 * An admin-only callable function to set a custom claim on a user's auth token.
 * This is the preferred way to handle roles for security rules.
 */
exports.setCustomUserRole = functions.https.onCall(async (data, context) => {
    // Ensure caller is an admin
    if (!context.auth || !context.auth.token.role === 'SuperAdmin') {
        throw new functions.https.HttpsError('permission-denied', 'Only a SuperAdmin can set user roles.');
    }

    const { userId, role } = data;
    if (!userId || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "userId" and a "role".');
    }

    try {
        // Set the custom claim on the user's authentication token
        await admin.auth().setCustomUserClaims(userId, { role: role });
        functions.logger.info(`Custom role '${role}' set for user ${userId} by admin ${context.auth.uid}`);
        return { success: true, message: `Role '${role}' has been set for user ${userId}.` };
    } catch (error) {
        functions.logger.error("Error setting custom user role:", error);
        throw new functions.https.HttpsError('internal', 'An error occurred while setting the user role.');
    }
});


/**
 * 6. Increment Job Application Count
 * 
 * Triggered when a new job application is created.
 * Increments the application counter on the corresponding job document.
 */
exports.incrementJobApplicationCount = functions.firestore
    .document('job_applications/{applicationId}')
    .onCreate(async (snap, context) => {
        const applicationData = snap.data();
        const jobId = applicationData.jobId;

        if (!jobId) {
            functions.logger.error("No jobId found on new application:", context.params.applicationId);
            return;
        }

        const jobRef = db.collection('jobs').doc(jobId);
        return jobRef.update({ applicationCount: admin.firestore.FieldValue.increment(1) });
    });

/**
 * 7. Decrement Job Application Count
 * 
 * Triggered when a job application is deleted.
 * Decrements the application counter on the corresponding job document.
 */
exports.decrementJobApplicationCount = functions.firestore
    .document('job_applications/{applicationId}')
    .onDelete(async (snap, context) => {
        const applicationData = snap.data();
        const jobId = applicationData.jobId;

        if (!jobId) {
            functions.logger.error("No jobId found on deleted application:", context.params.applicationId);
            return;
        }

        const jobRef = db.collection('jobs').doc(jobId);
        return jobRef.update({ applicationCount: admin.firestore.FieldValue.increment(-1) });
    });

/**
 * 8. On License Status Change Notification
 * 
 * Triggered when a license application's status is updated.
 * Sends a notification to the user (simulation).
 */
exports.onLicenseStatusChange = functions.firestore
    .document('license_applications/{applicationId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        if (newData.status !== oldData.status) {
            const userId = newData.userId;
            functions.logger.info(`License application for user ${userId} changed to ${newData.status}.`);
            // TODO: Add email or push notification logic here
            console.log(`(Simulated) Notification sent to user ${userId} about license status change.`);
        }
    });

/**
 * 9. On New Job Posted Notification
 * 
 * Triggered when a new job is created.
 * Placeholder for logic to notify relevant drivers.
 */
exports.onNewJobPosted = functions.firestore
    .document('jobs/{jobId}')
    .onCreate(async (snap, context) => {
        const jobData = snap.data();
        functions.logger.info("New job posted:", context.params.jobId, jobData.title);
        // TODO: Add logic to find matching drivers and send notifications
        console.log("(Simulated) Searching for drivers matching this job description...");
    });

/**
 * 10. Generate Thumbnail from Uploaded Image
 * 
 * Triggered when a new image is uploaded to Cloud Storage.
 * Creates a 200x200 thumbnail.
 */
exports.generateThumbnail = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // Exit if this is triggered on a file that isn't an image.
    if (!contentType.startsWith('image/')) {
        return functions.logger.log('This is not an image.');
    }
    // Exit if the image is already a thumbnail.
    const fileName = path.basename(filePath);
    if (fileName.startsWith('thumb_')) {
        return functions.logger.log('Already a Thumbnail.');
    }

    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = { contentType: contentType };
    
    await bucket.file(filePath).download({ destination: tempFilePath });
    functions.logger.log('Image downloaded locally to', tempFilePath);

    // Generate a thumbnail using sharp
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
    await sharp(tempFilePath).resize(200, 200).toFile(thumbFilePath);

    // Upload the thumbnail
    const thumbUploadPath = path.join(path.dirname(filePath), thumbFileName);
    await bucket.upload(thumbFilePath, {
        destination: thumbUploadPath,
        metadata: metadata,
    });

    // Clean up the local files
    return fs.unlinkSync(tempFilePath) && fs.unlinkSync(thumbFilePath);
});

/**
 * 11. Selcom Payment Webhook
 * 
 * An HTTPS endpoint to receive payment status updates from Selcom.
 * Updates the corresponding 'payments' and 'test_attempts' documents in Firestore.
 */
exports.selcomWebhook = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Selcom webhook received!", { body: request.body });

    // Selcom sends data with Content-Type: application/json but the body might be a string.
    let data;
    try {
        // In some environments, request.body is already parsed. In others, it's a raw string.
        data = (typeof request.body === 'string') ? JSON.parse(request.body) : request.body;
    } catch (error) {
        functions.logger.error("Failed to parse request body:", error);
        response.status(400).send("Invalid JSON format");
        return;
    }

    const { order_id, status, reference } = data; // 'reference' is the payment reference ID from Selcom

    if (!order_id) {
        functions.logger.error("Webhook payload missing 'order_id'.", { payload: data });
        response.status(400).send("Missing 'order_id'");
        return;
    }

    try {
        const paymentsRef = db.collection("payments");
        // The markdown file uses 'transactionId' and 'referenceId'.
        // The client code in PaymentPage.tsx uses 'selcomTransactionId'.
        // My previous code used 'selcomTransactionId'. I'll stick with that as it's more specific.
        const querySnapshot = await paymentsRef.where("selcomTransactionId", "==", order_id).get();

        if (querySnapshot.empty) {
            functions.logger.error(`No payment found with selcomTransactionId: ${order_id}`);
            response.status(404).send("Payment not found");
            return;
        }

        const paymentDoc = querySnapshot.docs[0];
        const paymentId = paymentDoc.id;
        const paymentData = paymentDoc.data();
        
        // Avoid processing the same webhook multiple times
        if (paymentData.status === 'completed' || paymentData.status === 'failed') {
            functions.logger.warn(`Payment ${paymentId} already in a final state: ${paymentData.status}. Ignoring webhook.`);
            response.status(200).send("Webhook ignored, payment already processed.");
            return;
        }

        let newStatus = paymentData.status; // Default to current status
        if (status === "COMPLETED") {
            newStatus = "completed";
        } else if (status === "FAILED" || status === "REJECTED") { // Selcom might use FAILED or REJECTED
            newStatus = "failed";
        }
        
        // Create an update object
        const updatePayload = {
            status: newStatus,
            selcomWebhookData: data // Store the full webhook payload for auditing
        };

        // Update the payment status
        await db.collection("payments").doc(paymentId).update(updatePayload);
        functions.logger.info(`Payment ${paymentId} status updated to ${newStatus}`);

        // If payment is completed, update the corresponding test_attempt
        if (newStatus === "completed" && paymentData.service === "JiTesti" && paymentData.testAttemptId) {
            const testAttemptRef = db.collection("test_attempts").doc(paymentData.testAttemptId);
            const testAttemptDoc = await testAttemptRef.get();

            if (testAttemptDoc.exists) {
                // Update only if it's still pending payment
                if(testAttemptDoc.data().status === 'pending_payment') {
                    await testAttemptRef.update({ status: "started" });
                    functions.logger.info(`Test attempt ${paymentData.testAttemptId} status updated to 'started'`);
                } else {
                    functions.logger.warn(`Test attempt ${paymentData.testAttemptId} was not in 'pending_payment' state. Current state: ${testAttemptDoc.data().status}`);
                }
            } else {
                 functions.logger.error(`Test attempt with ID ${paymentData.testAttemptId} not found.`);
            }
        }

        response.status(200).send("Webhook processed successfully.");

    } catch (error) {
        functions.logger.error("Error processing webhook:", error);
        response.status(500).send("Internal Server Error");
    }
});