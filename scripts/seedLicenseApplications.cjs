const admin = require('firebase-admin');
const { faker } = require('@faker-js/faker');
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

const seedLicenseApplications = async () => {
  console.log('Clearing existing license applications...');
  const snapshot = await db.collection('license_applications').get();
  const deletePromises = [];
  snapshot.forEach(doc => {
    deletePromises.push(doc.ref.delete());
  });
  await Promise.all(deletePromises);
  console.log('Existing license applications cleared.');

  console.log('Starting license application seeding process...');
  const applications = [];
  for (let i = 0; i < 20; i++) {
    const application = {
      userId: faker.string.uuid(),
      applicationType: faker.helpers.arrayElement(['New License', 'License Renewal', 'LATRA Exam']),
      fullName: faker.person.fullName(),
      fullNameNormalized: faker.person.fullName().toLowerCase(),
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      region: faker.location.state(),
      district: faker.location.city(),
      licenseCategory: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']),
      status: faker.helpers.arrayElement(['submitted', 'pending_payment', 'pending', 'under_review', 'approved', 'rejected', 'completed']),
      refNo: `DEREVA-${faker.string.alphanumeric(6).toUpperCase()}`,
      submittedOn: admin.firestore.Timestamp.fromDate(faker.date.past()),
      documents: [
        {
          documentType: 'NIDA',
          fileUrl: faker.image.url(),
          fileName: 'nida.jpg',
          uploadDate: faker.date.past().toISOString(),
        },
        {
          documentType: 'Passport Photo',
          fileUrl: faker.image.url(),
          fileName: 'passport.jpg',
          uploadDate: faker.date.past().toISOString(),
        },
      ],
    };
    applications.push(application);
  }

  for (const application of applications) {
    try {
      const docRef = await db.collection('license_applications').add(application);
      await docRef.update({ id: docRef.id });
      console.log(`Successfully seeded application for ${application.fullName}`);
    } catch (error) {
      console.error(`!!! Failed to seed application for ${application.fullName}:`, error.message);
    }
  }

  console.log('License application seeding process finished.');
};

seedLicenseApplications();
