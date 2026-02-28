const fs = require('fs');
const path = require('path');

const generateFirefooQueries = () => {
  try {
    const testsDir = path.join(__dirname, '..', 'Tests');
    const files = fs.readdirSync(testsDir);
    const allQueries = [];

    for (const file of files) {
      if (path.extname(file) === '.md') {
        const filePath = path.join(testsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const questions = [];
        const questionRegex = /([0-9]+)\.\s(.*?)\n\n(.*?)\n\na\)\s(.*?)\nb\)\s(.*?)\nc\)\s(.*?)(?:\nd\)\s(.*?))?/gs;
        let match;
        while ((match = questionRegex.exec(content)) !== null) {
          const a = match[4].trim();
          const b = match[5].trim();
          const c = match[6].trim();
          const d = match[7] ? match[7].trim() : '';

          const options = [
            { optionKey: 'A', optionTextSw: a, optionTextEn: '' },
            { optionKey: 'B', optionTextSw: b, optionTextEn: '' },
            { optionKey: 'C', optionTextSw: c, optionTextEn: '' },
          ];
          if (d) {
            options.push({ optionKey: 'D', optionTextSw: d, optionTextEn: '' });
          }

          const question = {
            id: `bdt_q_${match[1]}`,
            question_text_sw: match[2].trim(),
            question_text_en: '',
            question_type: 'MCQ',
            options,
            correctAnswer: null,
            difficulty: 'Unknown',
            is_active: 1,
            image: null,
            video_url: null,
            category: 'BDT',
            modified: new Date().toISOString(),
          };
          questions.push(question);
        }

        const fileQueries = questions.map(q => {
          return `db.collection('Test Question').doc('${q.id}').set(${JSON.stringify(q, null, 2)});`;
        });

        allQueries.push(`// Queries for ${file}`);
        allQueries.push(...fileQueries);
        allQueries.push('\n');
      }
    }

    fs.writeFileSync('generatedQueries.js', allQueries.join('\n'));
    console.log('✅ Successfully generated queries in generatedQueries.js');

  } catch (error) {
    console.error('Error generating queries:', error);
  }
};

generateFirefooQueries();
