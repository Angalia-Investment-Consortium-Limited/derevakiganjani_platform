
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Path to the seed file
const seedFilePath = path.join(__dirname, '..', 'vip_driver_theory_seed_20.json');

const seedVipTest = async () => {
  try {
    // Read the JSON file
    const seedFile = fs.readFileSync(seedFilePath, 'utf8');
    const seedData = JSON.parse(seedFile);

    const { test, questions } = seedData;

    if (!test || !questions) {
      console.error('Invalid seed file format. Missing "test" or "questions" key.');
      return;
    }

    const now = new Date().toISOString();

    // --- 1. Seed Course (for Course Manager) ---
    const courseId = 'course-vip-test';
    const courseRef = db.collection('Course').doc(courseId);
    await courseRef.set({
        name: courseId, // Set name to be the same as the ID
        course_name_en: 'VIP Driver Self-Assessment',
        course_name_sw: 'Mtihani wa Kujipima wa Dereva wa VIP',
        description_en: 'A self-assessment test for VIP drivers.',
        description_sw: 'Mtihani wa kujipima kwa madereva wa VIP.',
        course_category: 'professional',
        course_track: 'testing',
        duration_hours: test.duration_minutes / 60,
        is_active: 1,
        is_free: 1,
        level: 'Advanced',
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
      
      let correctAnswerKey = null;
      const options = q.options.map((opt, index) => {
        const optionKey = String.fromCharCode(65 + index); // A, B, C...
        if (opt.is_correct) {
          correctAnswerKey = optionKey;
        }
        return {
          optionKey: optionKey,
          optionTextSw: opt.text_sw,
          optionTextEn: '' 
        };
      });

      await questionRef.set({
        id: q.id,
        question_text_sw: q.question_text_sw,
        question_text_en: '',
        question_type: 'MCQ',
        options: options,
        correctAnswer: correctAnswerKey,
        difficulty: 'Unknown',
        is_active: 1, // Set to 1 for Published
        image: q.image || null,
        video_url: null,
        category: test.license_class, // Assign category from test data
        modified: now
      });
    }
    console.log(`✅ Seeded ${questions.length} questions to the Test Question collection.`);
    console.log('\n🚀 Seeding complete! The test should now be visible in both Course and Question Bank Management.');

  } catch (error) {
    console.error('Error seeding VIP test:', error);
  }
};

seedVipTest();
