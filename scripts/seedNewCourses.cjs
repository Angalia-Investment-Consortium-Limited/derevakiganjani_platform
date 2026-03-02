
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

const courses = [
    {
        name: 'COURSE-002',
        course_name_en: "Road Safety Fundamentals",
        course_name_sw: "Misingi ya Usalama Barabarani",
        description_en: "Master essential road safety rules and regulations",
        description_sw: "Bobea kanuni na sheria muhimu za usalama barabarani",
        course_track: 'General',
        course_category: 'basic',
        level: "Beginner",
        duration_hours: 4,
        total_lessons: 12,
        thumbnail: '/images/courses/road_safety.png',
        thumbnail_emoji: '🚦',
        status: 'Published',
        is_active: 1,
        price: 0,
        is_free: 1,
        published_date: '2024-03-10'
    },
    {
        name: 'COURSE-003',
        course_name_en: "Traffic Signs & Signals",
        course_name_sw: "Alama za Barabarani na Ishara",
        description_en: "Learn to recognize and understand all traffic signs",
        description_sw: "Jifunze kutambua na kuelewa alama zote za barabarani",
        course_track: 'General',
        course_category: 'basic',
        level: "Beginner",
        duration_hours: 5,
        total_lessons: 15,
        thumbnail: '/images/courses/traffic_signs.png',
        thumbnail_emoji: '🚸',
        status: 'Published',
        is_active: 1,
        price: 0,
        is_free: 1,
        published_date: '2024-03-11'
    },
    {
        name: 'COURSE-004',
        course_name_en: "Vehicle Maintenance Basics",
        course_name_sw: "Matunzo ya Msingi ya Gari",
        description_en: "Essential vehicle care and maintenance",
        description_sw: "Utunzaji na matengenezo muhimu ya gari",
        course_track: 'Maintenance',
        course_category: 'basic',
        level: "Beginner",
        duration_hours: 3,
        total_lessons: 10,
        thumbnail: '/images/courses/vehicle_maintenance.png',
        thumbnail_emoji: '🔧',
        status: 'Published',
        is_active: 1,
        price: 0,
        is_free: 1,
        published_date: '2024-03-12'
    },
    {
        name: 'COURSE-005',
        course_name_en: "Emergency Response",
        course_name_sw: "Mwitikio wa Dharura",
        description_en: "How to handle road emergencies",
        description_sw: "Jinsi ya kukabiliana na dharura za barabarani",
        course_track: 'Safety',
        course_category: 'intermediate',
        level: "Intermediate",
        duration_hours: 3,
        total_lessons: 8,
        thumbnail: '/images/courses/emergency_response.png',
        thumbnail_emoji: '🚨',
        status: 'Published',
        is_active: 1,
        price: 30000,
        is_free: 0,
        published_date: '2024-03-13'
    },
    {
        name: 'COURSE-006',
        course_name_en: "Commercial Driving",
        course_name_sw: "Uendeshaji wa Kibiashara",
        description_en: "Professional driving for commercial vehicles",
        description_sw: "Uendeshaji wa kitaalamu wa magari ya kibiashara",
        course_track: 'Professional',
        course_category: 'advanced',
        level: "Advanced",
        duration_hours: 8,
        total_lessons: 20,
        thumbnail: '/images/courses/commercial_driving.png',
        thumbnail_emoji: '🚚',
        status: 'Published',
        is_active: 1,
        price: 150000,
        is_free: 0,
        published_date: '2024-03-14'
    }
];

const seedCourses = async () => {
  const coursesCollection = db.collection('Course');
  for (const course of courses) {
    await coursesCollection.doc(course.name).set(course);
    console.log(`Added course: ${course.course_name_en}`);
  }
};

seedCourses().then(() => {
    console.log('Seeding of new courses complete');
    admin.app().delete();
});
