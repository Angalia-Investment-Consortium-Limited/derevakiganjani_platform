
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const seedAdminData = async () => {
  try {
    console.log('Starting Admin module seeding...');

    // 1. Seed Admin User
    const adminUser = { userId: 'ADMIN_USER_ID', name: 'The Admin', role: 'SuperAdmin', addedAt: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection('admins').doc(adminUser.userId).set(adminUser);
    console.log(`-> Seeded admin user: ${adminUser.name}`);

    // 2. Seed Question Bank
    const q1 = { question_text_en: 'What is the purpose of a seatbelt?', options: [{ text: 'To keep the car clean', isCorrect: false }, { text: 'To restrain you in case of a crash', isCorrect: true }], topic: 'Safety' };
    const q2 = { question_text_en: 'A triangular sign indicates what?', options: [{ text: 'A warning', isCorrect: true }, { text: 'An order', isCorrect: false }], topic: 'Road Signs' };
    const questionRef1 = await db.collection('questions').add(q1);
    const questionRef2 = await db.collection('questions').add(q2);
    console.log(`-> Seeded 2 questions into the question bank.`);

    // 3. Seed a Test Configuration
    const test = { test_title_en: 'Driver Safety Basics', courseId: 'KjMmR3iDGlpurHV1yJEQ', questionIds: [questionRef1.id, questionRef2.id], pass_mark_percentage: 50 };
    const testRef = await db.collection('tests').add(test);
    console.log(`-> Seeded test: "${test.test_title_en}" (${testRef.id})`);

    // 4. Seed a Payment Record
    const payment = { userId: 'TEST_DRIVER_ID_1', service: 'License Application Fee', referenceId: 'LICENSE_APP_001', amount: 45000, provider: 'Selcom', transactionId: 'SEL12345XYZ', status: 'Completed', timestamp: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection('payments').add(payment);
    console.log(`-> Seeded a sample payment record.`);

    console.log('\nAdmin module seeding completed successfully!');

  } catch (error) {
    console.error('\nError seeding Admin module:', error);
  }
};

seedAdminData();
