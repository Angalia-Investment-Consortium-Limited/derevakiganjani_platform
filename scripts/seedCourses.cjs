
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const courses = [
    {
        name: 'COURSE-001',
        course_name_en: 'Defensive Driving',
        course_name_sw: 'Uendeshaji wa Kujihami',
        description_en: 'Learn to drive defensively and anticipate hazards.',
        description_sw: 'Jifunze kuendesha gari kwa kujihami na kutarajia hatari.',
        course_track: 'professional',
        course_category: 'basic',
        level: 'Advanced',
        duration_hours: 10,
        total_lessons: 5,
        thumbnail: '/images/courses/defensive_driving.png',
        thumbnail_emoji: '🛡️',
        status: 'Published',
        is_active: 1,
        price: 50000,
        is_free: 0,
        published_date: '2024-01-15'
      },
];

const seedCourses = async () => {
  const coursesCollection = db.collection('courses');
  for (const course of courses) {
    await coursesCollection.doc(course.name).set(course);
    console.log(`Added course: ${course.course_name_en}`);
  }
};

seedCourses().then(() => console.log('Seeding complete'));

