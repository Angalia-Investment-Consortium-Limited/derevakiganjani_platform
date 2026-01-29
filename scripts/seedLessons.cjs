
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const lessons = [
    {
        name: 'LESSON-001',
        lesson_title_en: 'Introduction to Defensive Driving',
        lesson_title_sw: 'Utangulizi wa Uendeshaji wa Kujihami',
        course: 'COURSE-001',
        lesson_order: 1,
        content_type: 'video',
        duration_minutes: 20,
        summary_en: 'Understanding the core principles.',
        summary_sw: 'Kuelewa kanuni za msingi.',
        is_locked: 0,
        is_active: 1
      },
];

const seedLessons = async () => {
  const lessonsCollection = db.collection('lessons');
  for (const lesson of lessons) {
    await lessonsCollection.doc(lesson.name).set(lesson);
    console.log(`Added lesson: ${lesson.lesson_title_en}`);
  }
};

seedLessons().then(() => console.log('Seeding complete'));

