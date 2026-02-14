const admin = require('firebase-admin');
const { faker } = require('@faker-js/faker');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const seedLicenseApplications = async () => {
  try {
    console.log('Connecting to Firestore...');

    // 1. Clear existing data
    console.log('Clearing existing license applications...');
    const snapshot = await db.collection('license_applications').get();
    if (snapshot.empty) {
      console.log('No existing documents to delete.');
    } else {
      const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`${deletePromises.length} existing license applications cleared.`);
    }

    // 2. Prepare new data
    console.log('Generating 20 new license applications...');
    const applications = [];
    const licenseCategories = ['A', 'A2', 'B', 'C', 'C1', 'C2', 'C3', 'D', 'E'];
    const projectId = serviceAccount.project_id;
    const bucket = `${projectId}.appspot.com`;

    const createFakeStorageUrl = (fileName) => {
        const filePath = `documents/${faker.string.uuid()}/${fileName}`;
        const encodedPath = encodeURIComponent(filePath);
        return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${faker.string.uuid()}`;
    };

    for (let i = 0; i < 20; i++) {
      const fullName = faker.person.fullName();
      const status = faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']);
      const applicantAdvice = status !== 'Pending' ? faker.lorem.sentence() : '';

      const application = {
        userId: faker.string.uuid(),
        applicationType: faker.helpers.arrayElement(['New', 'Renewal']),
        fullName: fullName,
        fullNameNormalized: fullName.toLowerCase(),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email().toLowerCase(),
        region: faker.location.state(),
        district: faker.location.city(),
        categories: faker.helpers.arrayElements(licenseCategories, { min: 1, max: 3 }),
        status: status,
        submittedOn: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 1 })),
        documents: [
          {
            documentType: 'National ID',
            fileName: 'national_id.pdf',
            fileUrl: createFakeStorageUrl('national_id.pdf'),
          },
          {
            documentType: 'KRA Pin Certificate',
            fileName: 'kra_pin.pdf',
            fileUrl: createFakeStorageUrl('kra_pin.pdf'),
          }
        ],
        ...(status !== 'Pending' && {
          applicantAdvice: applicantAdvice,
          adminNotes: faker.lorem.paragraph(),
          remarks: applicantAdvice,
        })
      };
      applications.push(application);
    }

    console.log(`Generated ${applications.length} applications.`);

    // 3. Seed data in a batch
    console.log('Seeding new data...');
    const batch = db.batch();
    applications.forEach(app => {
      const docRef = db.collection('license_applications').doc();
      batch.set(docRef, app);
    });
    await batch.commit();

    console.log('\nLicense application seeding completed successfully!');

  } catch (error) {
    console.error('\nError seeding license applications:', error);
  }
};

seedLicenseApplications();
