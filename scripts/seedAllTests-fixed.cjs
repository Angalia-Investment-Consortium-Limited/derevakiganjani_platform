
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Error initializing Firebase Admin SDK.', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// --- Start: Markdown Parser and Seeder ---
const parseAndSeedMarkdownTests = async () => {
  try {
    const testsDir = path.join(__dirname, '..', 'Tests');
    const files = fs.readdirSync(testsDir);

    for (const file of files) {
      if (path.extname(file) !== '.md') continue;

      console.log(`--- Processing: ${file} ---`);
      const mdFilePath = path.join(testsDir, file);
      const mdContent = fs.readFileSync(mdFilePath, 'utf8');

      // Extract License Class from filename (e.g., BASIC_DRIVERS_TEST_BDT.md -> BDT)
      const fileName = path.basename(file, '.md');
      const parts = fileName.split('_');
      const licenseClass = parts[parts.length - 1];

      const lines = mdContent.split(/\r?\n/);
      
      let test = {
          license_class: licenseClass,
          duration_minutes: 90, // Default duration, can be parsed from instructions if needed
      };

      let questions = [];
      let currentQuestion = null;

      for (const line of lines) {
          // Match question number and text (e.g., "1. Nini maana...")
          const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (questionMatch) {
              if (currentQuestion) {
                  questions.push(currentQuestion);
              }
              currentQuestion = {
                  id: `${licenseClass}-${questionMatch[1].padStart(3, '0')}`,
                  question_text_sw: questionMatch[2].trim(),
                  options: [],
                  // WARNING: Correct answer is NOT specified in the markdown.
                  // Defaulting to 'A' as a placeholder.
                  correctAnswer: 'A',
              };
              continue;
          }

          // Match option letter and text (e.g., "a) Picha...")
          const optionMatch = line.match(/^([a-d])\)\s+(.*)/);
          if (optionMatch && currentQuestion) {
              const optionKey = optionMatch[1].toUpperCase();
              currentQuestion.options.push({
                  optionKey: optionKey,
                  optionTextSw: optionMatch[2].trim(),
                  optionTextEn: '' // English text is not available in the source
              });
          }
      }
      // Add the last question
      if (currentQuestion) {
          questions.push(currentQuestion);
      }
      
      if (!questions.length) {
          console.log(`No questions found in ${file}. Skipping.`);
          continue;
      }

      const now = new Date().toISOString();

      // --- 1. Seed Course ---
      const courseId = `course-${test.license_class.toLowerCase()}-test`;
      const courseRef = db.collection('Course').doc(courseId);
      await courseRef.set({
          name: courseId,
          course_name_en: `${test.license_class} Driver Self-Assessment`,
          course_name_sw: `Mtihani wa Kujipima wa Dereva wa ${test.license_class}`,
          description_en: `A self-assessment test for ${test.license_class} drivers.`,
          description_sw: `Mtihani wa kujipima kwa madereva wa ${test.license_class}.`,
          course_category: 'professional',
          course_track: 'testing',
          duration_hours: test.duration_minutes / 60,
          is_active: 1, is_free: 1, level: 'Beginner', price: 0, status: 'Published',
          total_lessons: 1,
          modified: now
      });
      console.log(`✅ Seeded Course: ${courseId}`);

      // --- 2. Seed Questions ---
      const questionsCollection = db.collection('Test Question');
      for (const q of questions) {
        const questionRef = questionsCollection.doc(q.id);
        await questionRef.set({
          id: q.id,
          question_text_sw: q.question_text_sw,
          question_text_en: '',
          question_type: 'MCQ',
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: 'Unknown',
          is_active: 1,
          image: null,
          video_url: null,
          category: test.license_class,
          modified: now
        });
      }
      console.log(`✅ Seeded ${questions.length} questions for ${test.license_class}.`);
    }

    console.log('\n🚀 All test markdown files have been processed.');

  } catch (error) {
    console.error('Error seeding tests from Markdown:', error);
  } finally {
    admin.app().delete();
  }
};

parseAndSeedMarkdownTests();
