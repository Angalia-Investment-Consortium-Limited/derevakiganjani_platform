
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Function to parse test files and seed data
const seedTests = async () => {
  const testsDir = path.join(__dirname, '../Tests');
  const testFiles = fs.readdirSync(testsDir);
  const now = new Date().toISOString();

  for (const testFile of testFiles) {
    if (path.extname(testFile) === '.md') {
      const filePath = path.join(testsDir, testFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract test title and questions from the markdown file
      const { title, questions } = parseTestFile(content);
      
      // Get the category from the file name
      const category = getCategoryFromFileName(testFile);

      // --- 1. Seed Questions (for Question Bank Manager) ---
      const questionsCollection = db.collection('Test Question');
      for (const q of questions) {
        const questionRef = questionsCollection.doc(); // Let Firestore generate the ID
        
        let correctAnswerKey = null;
        const options = q.options.map((opt, index) => {
          const optionKey = String.fromCharCode(65 + index); // A, B, C...
          if (opt.isCorrect) {
            correctAnswerKey = optionKey;
          }
          return {
            optionKey: optionKey,
            optionTextSw: opt.text,
            optionTextEn: '' 
          };
        });

        await questionRef.set({
          question_text_sw: q.text,
          question_text_en: '',
          question_type: 'MCQ',
          options: options,
          correctAnswer: correctAnswerKey,
          difficulty: 'Unknown',
          is_active: 1, // Set to 1 for Published
          image: null,
          video_url: null,
          category: category,
          modified: now
        });
      }
      console.log(`✅ Seeded ${questions.length} questions to the Test Question collection for test "${title}".`);
    }
  }
};


// Helper function to parse the markdown test file
const parseTestFile = (content) => {
  const lines = content.split('\n');
  const title = lines[0].replace('##', '').trim();
  const questions = [];
  let currentQuestion = null;

  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        text: line.replace(/^\d+\./, '').trim(),
        options: [],
        answer: ''
      };
    } else if (line.match(/^[a-d]\)/)) {
      const isCorrect = line.includes('(Correct)');
      const text = line.replace(/^[a-d]\)/, '').replace('(Correct)', '').trim();
      currentQuestion.options.push({ text, isCorrect });
      if (isCorrect) {
        currentQuestion.answer = text;
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return { title, questions };
};


// Helper function to get the category from the file name
const getCategoryFromFileName = (fileName) => {
  if (fileName.includes('BASIC')) return 'BASIC';
  if (fileName.includes('HGV')) return 'HGV';
  if (fileName.includes('INTERVIEW')) return 'INTERVIEW';
  if (fileName.includes('MOTO')) return 'MOTO';
  if (fileName.includes('PSV')) return 'PSV';
  if (fileName.includes('VIP')) return 'VIP';
  return 'GENERAL';
};

// Run the seeding function
seedTests().then(() => {
  console.log('All tests and questions seeded successfully!');
  process.exit(0);
}).catch(error => {
  console.error('Error seeding tests:', error);
  process.exit(1);
});
