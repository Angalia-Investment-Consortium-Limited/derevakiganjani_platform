
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

const usersToCreate = [
  {
    email: 'mdv@aicl.co.tz',
    password: 'Yeshua@2025',
    role: 'Admin',
    profileData: {
      role: 'SuperAdmin', // Required by firestore.rules for isAdmin()
      fullName: 'MDV Admin',
      email: 'mdv@aicl.co.tz',
    },
    profileCollection: 'admins'
  },
  {
    email: 'charterdkintu@gmail.com',
    password: 'Yeshua@2025',
    role: 'Employer',
    profileData: {
      companyName: 'Charter D Kintu',
      contactPerson: 'Charter',
      email: 'charterdkintu@gmail.com',
      verificationStatus: 'Verified' // Required for isVerifiedEmployer()
    },
    profileCollection: 'employers'
  },
  {
    email: 'founder@aicl.co.tz',
    password: 'Yeshua@2025',
    role: 'Driver',
    profileData: {
      fullName: 'Founder AICL',
      email: 'founder@aicl.co.tz',
      licenseNumber: 'DL12345'
    },
    profileCollection: 'driver_profiles'
  }
];

const seedUsers = async () => {
  console.log('Starting user seeding process...');
  for (const userData of usersToCreate) {
    try {
      let uid;
      try {
        // Create user in Firebase Authentication
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          emailVerified: true,
          disabled: false
        });
        uid = userRecord.uid;
        console.log(`Successfully created user in Auth: ${userData.email} (UID: ${uid})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`Auth user ${userData.email} already exists. Fetching UID.`);
          const userRecord = await auth.getUserByEmail(userData.email);
          uid = userRecord.uid;
        } else {
          throw error;
        }
      }

      // Set custom claims for role-based access
      await auth.setCustomUserClaims(uid, { role: userData.role });
      console.log(`Set custom claim for ${userData.email}: { role: '${userData.role}' }`);

      // Create document in 'users' collection
      const userDocRef = db.collection('users').doc(uid);
      await userDocRef.set({
        uid,
        email: userData.email,
        roles: [userData.role],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Created/updated document in 'users' collection for ${userData.email}`);

      // Create document in role-specific profile collection
      const profileDocRef = db.collection(userData.profileCollection).doc(uid);
      await profileDocRef.set({
        ...userData.profileData,
        uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`Created/updated profile in '${userData.profileCollection}' for ${userData.email}`);
      
      console.log(`--- Successfully processed user: ${userData.email} ---\n`);

    } catch (error) {
      console.error(`!!! Failed to process user ${userData.email}:`, error.message);
    }
  }
  console.log('User seeding process finished.');
};

seedUsers();
