const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({ ...serviceAccount, private_key: privateKey })
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK. Make sure the serviceAccountKey.json file is present in the scripts directory.', error);
  process.exit(1);
}

const db = admin.firestore();

const seedFromMarkdown = async () => {
  try {
    const filePath = path.join(__dirname, '..', 'Tests', 'BASIC_DRIVERS_TEST_BDT.md');
    const content = fs.readFileSync(filePath, 'utf8');

    const questions = [];
    const questionRegex = /([0-9]+)\.\s(.*?)\n\n(.*?)\n\na\)\s(.*?)\nb\)\s(.*?)\nc\)\s(.*?)(?:\nd\)\s(.*?))?/gs;
    let match;
    while ((match = questionRegex.exec(content)) !== null) {
      const a = match[4].trim()
      const b = match[5].trim()
      const c = match[6].trim()
      const d = match[7] ? match[7].trim() : ''

      const options = [
        {
          optionKey: 'A',
          optionTextSw: a,
          optionTextEn: ''
        },
        {
          optionKey: 'B',
          optionTextSw: b,
          optionTextEn: ''
        },
        {
          optionKey: 'C',
          optionTextSw: c,
          optionTextEn: ''
        }
      ]
      if (d) {
        options.push(
          {
            optionKey: 'D',
            optionTextSw: d,
            optionTextEn: ''
          }
        )
      }
      
      const question = {
        id: `bdt_q_${match[1]}`,
        question_text_sw: match[2].trim(),
        question_text_en: '',
        question_type: 'MCQ',
        options,
        correctAnswer: null, // This will be updated later
        difficulty: 'Unknown',
        is_active: 1,
        image: null,
        video_url: null,
        category: 'BDT',
        modified: new Date().toISOString()
      };
      questions.push(question);
    }

    const now = new Date().toISOString();

    // --- 1. Seed Course (for Course Manager) ---
    const courseId = 'course-bdt-test';
    const courseRef = db.collection('Course').doc(courseId);
    await courseRef.set({
        name: courseId, // Set name to be the same as the ID
        course_name_en: 'Basic Drivers Knowledge Test',
        course_name_sw: 'Mtihani wa Kupima Uelewa wa Madereva wa Awali',
        description_en: 'A basic knowledge test for drivers.',
        description_sw: 'Mtihani wa kupima uelewa wa awali kwa madereva.',
        course_category: 'professional',
        course_track: 'testing',
        duration_hours: 1.5,
        is_active: 1,
        is_free: 1,
        level: 'Basic',
        price: 0,
        status: 'Published',
        total_lessons: 1,
        modified: now
    });
    console.log(`✅ Seeded to Course collection for Course Management`);

    // --- 2. Seed Questions (for Question Bank Manager) ---
    const questionsCollection = db.collection('Test Question');
    for (const q of questions) {
      const questionRef = questionsCollection.doc(q.id);
      await questionRef.set(q);
    }
    console.log(`✅ Seeded ${questions.length} questions to the Test Question collection.`);
    console.log('\n🚀 Seeding complete! The test should now be visible in both Course and Question Bank Management.');

  } catch (error) {
    console.error('Error seeding from markdown:', error);
  }
};

seedFromMarkdown();