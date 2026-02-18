const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Correctly locate the service account key in the project root
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// Check if the service account key file exists
if (!fs.existsSync(serviceAccountPath)) {
    console.error(`FATAL ERROR: Firebase service account key not found at: ${serviceAccountPath}`);
    console.error("Please ensure the 'serviceAccountKey.json' file exists in the project's root directory.");
    process.exit(1); // Exit the script with an error code
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const seedCategoryTest = async (seedFile) => {
  try {
    const seedFilePath = path.join(__dirname, '..', seedFile);
    console.log(`Reading seed file from: ${seedFilePath}`);

    const fileContent = fs.readFileSync(seedFilePath, 'utf8');
    const seedData = JSON.parse(fileContent);

    const { test, questions } = seedData;

    if (!test || !questions) {
      console.error('ERROR: Invalid seed file format. It must contain a "test" object and a "questions" array.');
      return;
    }

    if (!test.id || !test.courseId || !test.title) {
        console.error('ERROR: The "test" object in the seed file is missing required fields: id, courseId, or title.');
        return;
    }

    console.log(`Starting seed for test: "${test.title}"`);

    const now = admin.firestore.FieldValue.serverTimestamp();
    const questionIds = [];

    // --- 1. Seed Questions into 'Test Question' collection ---
    const questionsCollection = db.collection('Test Question');
    for (const q of questions) {
      if (!q.id || !q.question_text_sw || !q.options) {
        console.warn(`Skipping a question due to missing id, question_text_sw, or options.`);
        continue;
      }

      const questionRef = questionsCollection.doc(q.id);
      questionIds.push(q.id); // Collect the ID for the 'tests' document
      
      let correctAnswerKey = null;
      const optionsObject = {};
      q.options.forEach((opt, index) => {
        const optionKey = String.fromCharCode(65 + index); // A, B, C...
        if (opt.is_correct) {
          correctAnswerKey = optionKey;
        }
        optionsObject[index] = {
          optionKey: optionKey,
          optionTextSw: opt.text_sw,
          optionTextEn: opt.text_en || ''
        };
      });

      await questionRef.set({
        id: q.id,
        category: test.courseId, // Use the courseId as the category
        question_text_sw: q.question_text_sw,
        question_text_en: '',
        question_type: 'MCQ',
        options: optionsObject,
        correctAnswer: correctAnswerKey,
        difficulty: 'Not set',
        is_active: 1,
        image: q.image || null,
        video_url: null,
        createdAt: now,
        modified: now
      });
    }
    console.log(`✅ Seeded ${questions.length} questions into the 'Test Question' collection.`);

    // --- 2. Seed Test Document into 'tests' collection ---
    const testRef = db.collection('tests').doc(test.id);
    await testRef.set({
      courseId: test.courseId,
      test_title_en: test.title,
      pass_mark_percentage: test.pass_mark_percentage || 80,
      questionIds: questionIds, // The crucial link!
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✅ Seeded the main test document '${test.id}' into the 'tests' collection.`);
    console.log(`🔗 Linked test to category: '${test.courseId}' with ${questionIds.length} questions.`);

    console.log('\n🚀 Seeding complete! The test is now fully configured.');

  } catch (error) { 
    console.error('Error seeding test data:', error);
    if (error.code === 'ENOENT') {
        console.error(`Seed file not found. Make sure the file path is correct.`);
    }
  }
};

// --- How to run ---
// Get the seed file name from the command-line arguments.
const seedFile = process.argv[2];

if (!seedFile) {
  console.error('Please provide the name of the seed file as an argument.');
  console.log('Example: node scripts/seedCategoryTest.cjs vip_seed_data.json');
} else {
  seedCategoryTest(seedFile);
}
