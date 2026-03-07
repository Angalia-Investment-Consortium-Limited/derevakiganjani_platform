
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const onboardNewUser = functions.auth.user().onCreate(async (user) => {
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
  const { role } = roleDoc.data()!;
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

export const verifyEmployer = functions.https.onCall(async (data, context) => {
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
