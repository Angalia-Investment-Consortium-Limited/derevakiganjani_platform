
const admin = require('firebase-admin');
// Correctly requires the key from the same directory
const serviceAccount = require('./serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();

const lessons = [
    // Lessons for COURSE-002: Road Safety Fundamentals
    {
        lessonId: 'COURSE-002_LESSON-001',
        courseId: 'COURSE-002',
        title_en: "Introduction to Road Safety",
        title_sw: "Utangulizi wa Usalama Barabarani",
        content_en: "This lesson covers the basic principles of road safety...",
        content_sw: "Somo hili linahusu kanuni za msingi za usalama barabarani...",
        lesson_number: 1,
        duration_minutes: 20
    },
    {
        lessonId: 'COURSE-002_LESSON-002',
        courseId: 'COURSE-002',
        title_en: "Understanding Pedestrian Rules",
        title_sw: "Kuelewa Sheria za Watembea kwa Miguu",
        content_en: "Learn the do's and don'ts for pedestrians to ensure their safety.",
        content_sw: "Jifunze mambo ya kufanya na yasiyopaswa kufanywa na watembea kwa miguu ili kuhakikisha usalama wao.",
        lesson_number: 2,
        duration_minutes: 25
    },
    // Lessons for COURSE-003: Traffic Signs & Signals
    {
        lessonId: 'COURSE-003_LESSON-001',
        courseId: 'COURSE-003',
        title_en: "Regulatory Signs",
        title_sw: "Alama za Udhibiti",
        content_en: "An in-depth look at stop signs, yield signs, and speed limit signs.",
        content_sw: "Muonekano wa kina wa alama za kusimama, kupisha, na za ukomo wa kasi.",
        lesson_number: 1,
        duration_minutes: 30
    },
    {
        lessonId: 'COURSE-003_LESSON-002',
        courseId: 'COURSE-003',
        title_en: "Warning Signs",
        title_sw: "Alama za Tahadhari",
        content_en: "Identifying and understanding signs that warn of potential hazards.",
        content_sw: "Kutambua na kuelewa alama zinazotahadharisha kuhusu hatari zinazoweza kutokea.",
        lesson_number: 2,
        duration_minutes: 25
    }
];

const seedLessons = async () => {
  const lessonsCollection = db.collection('Lesson');
  console.log('Starting to seed lessons...');
  for (const lesson of lessons) {
    await lessonsCollection.doc(lesson.lessonId).set(lesson);
    console.log(`Added lesson: ${lesson.title_en}`);
  }
  console.log('Lesson seeding complete.');
};

seedLessons().then(() => {
    console.log('Finished seeding process. Closing connection.');
    admin.app().delete(); // Terminate the app to allow the script to exit
});
