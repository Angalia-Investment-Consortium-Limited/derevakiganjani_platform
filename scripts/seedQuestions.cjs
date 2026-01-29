
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const questions = [
    {
        categoryId: 'CAT-001', // Corresponds to 'Category A License Test'
        questionTextEn: 'What is the primary function of a clutch in a manual vehicle?',
        questionTextSw: 'Kazi kuu ya klachi katika gari la gia za mikono ni ipi?',
        questionType: 'MCQ',
        options: [
            { optionKey: 'A', optionTextEn: 'To change gears', optionTextSw: 'Kubadilisha gia' },
            { optionKey: 'B', optionTextEn: 'To stop the vehicle', optionTextSw: 'Kusimamisha gari' },
            { optionKey: 'C', optionTextEn: 'To connect and disconnect the engine from the transmission', optionTextSw: 'Kuunganisha na kutenganisha injini na usafirishaji' },
        ],
        correctAnswer: 'C',
        difficulty: 'Easy',
        isActive: true,
    },
    {
        categoryId: 'CAT-001',
        questionTextEn: 'When approaching a roundabout, you should give way to traffic from which direction?',
        questionTextSw: 'Unapokaribia barabara ya mzunguko, unapaswa kutoa njia kwa magari kutoka upande gani?',
        questionType: 'MCQ',
        options: [
            { optionKey: 'A', optionTextEn: 'From the left', optionTextSw: 'Kutoka kushoto' },
            { optionKey: 'B', optionTextEn: 'From the right', optionTextSw: 'Kutoka kulia' },
            { optionKey: 'C', optionTextEn: 'Straight ahead', optionTextSw: 'Moja kwa moja' },
        ],
        correctAnswer: 'B',
        difficulty: 'Medium',
        isActive: true,
    }
];

const seedQuestions = async () => {
  const questionsCollection = db.collection('questions');
  for (const question of questions) {
    await questionsCollection.add(question);
    console.log(`Added question: ${question.questionTextEn}`);
  }
};

seedQuestions().then(() => console.log('Seeding complete'));
