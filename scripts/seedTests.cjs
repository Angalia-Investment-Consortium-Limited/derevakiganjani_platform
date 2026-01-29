
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tests = [
    {
        name: 'TEST-001',
        category_name_en: 'Class A General Knowledge',
        category_name_sw: 'Ujuzi wa Jumla wa Daraja A',
        questions: [
            {
                question_text_en: 'What does this sign mean?',
                question_text_sw: 'Ishara hii inamaanisha nini?',
                media_url: '/images/signs/stop.png',
                options: ['Stop', 'Yield', 'Go'],
                correct_option_index: 0
            },
            {
                question_text_en: 'When are you allowed to overtake on the left?',
                question_text_sw: 'Ni lini unaruhusiwa kupita upande wa kushoto?',
                options: [
                    'When the driver in front of you is turning right',
                    'On a one-way street',
                    'Never'
                ],
                correct_option_index: 2
            }
        ]
    }
];

const seedTests = async () => {
  const testsCollection = db.collection('tests');
  for (const test of tests) {
    await testsCollection.doc(test.name).set(test);
    console.log(`Added test: ${test.category_name_en}`);
  }
};

seedTests().then(() => console.log('Seeding complete'));

