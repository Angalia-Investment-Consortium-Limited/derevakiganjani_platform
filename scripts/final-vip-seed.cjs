
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK directly with a template literal for the private key
const serviceAccount = {
  "type": "service_account",
  "project_id": "derevakiganjani",
  "private_key_id": "bdf8e6838af0fb03a09725693da1b9d713cb1de4",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPwq/rCNOcgg4r\nabHy7Udglu+5umtEwM+ZCs9WJ6e3UlrVWpgqogh4l4wVo+ICqyqVJnVBhWL10Y7t\n9OqmL/uI803ERxN6apCoOktcKKQmqiCggonGbjGeYEeolyXXyJZxnTWMi3qhqG6n\nScBG7I+jBSAcl6tPjneSL82W6Ijlru4s4bxk92t+jFeIijmlHKFKdBm07TsTL2R9\neIL/IhU8oM73GvikiHiO+YivEuPs/LlcwJIr6JTouO0X9sCoWSiGl20UqNCcEVZ0\njDLDTzMjdQeejXBBMZSah1Gcv7WbuOV7Tay1hfdKo/LS8zGmwAx/5H1Gm4W6Fcj6\nv7qNP8aNAgMBAAECggEAC+9+Vb1TEtmx4LKYw4D4KcdiDER2ZyPAiWVClgt/Khv0\nFe+3cDOQ0wS5yoB4uniE4L6t287C6aZZVLhORq/Y/nwjypPevZijqNZ4f9nh3ErH\xxDYw2qPNS8IztmoFeZzJiHG8sUMjX70pG2rOyfZ9J6Vwq6/67kei2ptoC7JtpAk\npQBBTw3F43wziO0eYXHAzIBeX9lfxXJQuH8nzPrT/tXLHcMx38i23QVOZmKLiIsr\n-untvnCmPMGMNUDqnDgH/WbGH7WdGGHr4m8y3gc9PaN4TZVj54dCwo7JxU0iPia3\nRCyqhdjw3bRHiTBODL8/yZMjbeeADrCV8SRHfvS3DQKBgQDoPjHmGXaPwQAt50hh\n3m4eu+kh8o+26ZbAJQgQQDU9J0LgHw/bcmTBnHHoekqZ3qILUMWG8D7635bvFjbq\nYMQqlDj86m239+sFvLjPBf5lYVnbJTTiq32KC9q5OI4xPBObC2R5Naeh6csNxp3R\nXu//BCx0y3cAEB1S6WxHrv3AgwKBgQDlA10z1am6Iixsu2QF+WWI/74btq/znjOF\nwrkurIYbFMTyv/O/ovh+djlV10sd2n6Mc50qnxyrr81oxaIzWuq4FjfZdLPvpAM2\nPnMWr6Q3BbZo2YLhbYHXcAoQzcuxKakjWQBXBpo46aSFwXtv2Qdul3c74dHGczDr\n/S87b8CPrwKBgFrK/cz8BWrbxAsuEREZ2Skww0qfPmn+1g2WLJnV0DpxH+bondVn\n2lYKqEl/jayr6ePMlvxS7fw77xDXOW7Vl7shqUnPCEfUp0/d4M4mhLbzoSJYYF2B\nN5oBWmfw4T4EQ5HomUX9oORetyBSlp4kpGSpKAwdAw/GPQCN+uPnWJKrAoGBAMIr\nngRq7iMhAmWWZHIkSJBltbwtovV9dtW8ieIm6PVhILNpSLN87A/dETPU/J1tOcq/\n48vVaCuxPQnON34vYb9/Jw86wa03dHmzbUUY2rTEJSq08SFNBb+yAPbKZh/p4LxV\no9IliPEkOBgoOg5VBtYfmjqtdn06AYq0+iz8zVmFAoGBAIap9YsO3z/3wh9Ayw9/\n0JQG4+OCv0XJxNmXkLdAS7GUOdlk+SLdugyUumxluaOPbAk65TNZSZOXjgcFrq2+\nEcFJoh+DYI8W7C1802WF89gm+Nqv/DBjseVDkG2YqMSdvVUgQ3i3wOSDjlT9e39/\nYMLZCG0rT0cqtOzvFVQCv8RY\n-----END PRIVATE KEY-----\n`,
  "client_email": "firebase-adminsdk-fbsvc@derevakiganjani.iam.gserviceaccount.com",
  "client_id": "115819045891150796115",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40derevakiganjani.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

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

      // --- Seed Questions (for Question Bank Manager) ---
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
