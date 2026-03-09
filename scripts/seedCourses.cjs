
const admin = require('firebase-admin');

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase admin initialization error', error);
    process.exit(1);
  }
}

const db = admin.firestore();

const coursesData = [
  {
    id: 'COURSE-001',
    name: 'Road Safety Fundamentals',
    course_name_en: 'Road Safety Fundamentals',
    course_name_sw: 'Misingi ya Usalama Barabarani',
    description_en: 'Master essential road safety rules and regulations',
    description_sw: 'Jifunze kanuni na sheria muhimu za usalama barabarani',
    total_lessons: 12,
    duration_hours: 4,
    level: 'Basic',
    course_category: 'Safety',
    course_track: 'elimika',
    is_active: 1,
    is_free: 1,
    price: 0,
    published_date: '2024-01-15',
    status: 'Published',
    thumbnail: 'courses/COURSE-001/thumbnail.png',
    thumbnail_emoji: '🚦',
    lessons: [
      { id: 'LESSON-001-01', title_en: 'Introduction to Road Safety', title_sw: 'Utangulizi wa Usalama Barabarani', order: 1, content_type: 'text_with_image' },
      { id: 'LESSON-001-02', title_en: 'Understanding Traffic Laws', title_sw: 'Kuelewa Sheria za Barabarani', order: 2, content_type: 'video' },
      { id: 'LESSON-001-03', title_en: 'Common Road Hazards', title_sw: 'Hatari za Kawaida Barabarani', order: 3, content_type: 'text' },
    ]
  },
  {
    id: 'COURSE-002',
    name: 'Traffic Signs & Signals',
    course_name_en: 'Traffic Signs & Signals',
    course_name_sw: 'Alama za Barabarani',
    description_en: 'Learn to recognize and understand all traffic signs',
    description_sw: 'Jifunze kutambua na kuelewa alama zote za barabarani',
    total_lessons: 15,
    duration_hours: 5,
    level: 'Basic',
    course_category: 'Driving Skills',
    course_track: 'elimika',
    is_active: 1,
    is_free: 1,
    price: 0,
    published_date: '2024-02-01',
    status: 'Published',
    thumbnail: 'courses/COURSE-002/thumbnail.png',
    thumbnail_emoji: '🚸',
    lessons: [
      { id: 'LESSON-002-01', title_en: 'Regulatory Signs', title_sw: 'Alama za Amri', order: 1, content_type: 'text_with_image' },
      { id: 'LESSON-002-02', title_en: 'Warning Signs', title_sw: 'Alama za Onyo', order: 2, content_type: 'text_with_image' },
      { id: 'LESSON-002-03', title_en: 'Informatory Signs', title_sw: 'Alama za Taarifa', order: 3, content_type: 'text' },
    ]
  },
  {
    id: 'COURSE-003',
    name: 'Defensive Driving',
    course_name_en: 'Defensive Driving',
    course_name_sw: 'Uendeshaji wa Kujihami',
    description_en: 'Advanced techniques for safe driving',
    description_sw: 'Mbinu za hali ya juu za uendeshaji salama',
    total_lessons: 18,
    duration_hours: 6,
    level: 'Intermediate',
    course_category: 'Advanced Skills',
    course_track: 'elimika',
    is_active: 1,
    is_free: 0,
    price: 15000,
    published_date: '2024-02-10',
    status: 'Published',
    thumbnail: 'courses/COURSE-003/thumbnail.png',
    thumbnail_emoji: '🛡️',
    lessons: [
      { id: 'LESSON-003-01', title_en: 'The SIPDE Process', title_sw: 'Mchakato wa SIPDE', order: 1, content_type: 'video' },
      { id: 'LESSON-003-02', title_en: 'Managing Space and Time', title_sw: 'Kusimamia Nafasi na Muda', order: 2, content_type: 'text_with_image' },
    ]
  },
  {
    id: 'COURSE-004',
    name: 'Vehicle Maintenance Basics',
    course_name_en: 'Vehicle Maintenance Basics',
    course_name_sw: 'Misingi ya Matunzo ya Gari',
    description_en: 'Essential vehicle care and maintenance',
    description_sw: 'Utunzaji muhimu wa gari lako',
    total_lessons: 10,
    duration_hours: 3,
    level: 'Basic',
    course_category: 'Technical',
    course_track: 'elimika',
    is_active: 1,
    is_free: 1,
    price: 0,
    published_date: '2024-02-20',
    status: 'Published',
    thumbnail: 'courses/COURSE-004/thumbnail.png',
    thumbnail_emoji: '🔧',
    lessons: [
      { id: 'LESSON-004-01', title_en: 'Daily Vehicle Checks', title_sw: 'Ukaguzi wa Gari Kila Siku', order: 1, content_type: 'text_with_image' },
      { id: 'LESSON-004-02', title_en: 'Understanding Dashboard Lights', title_sw: 'Kuelewa Taa za Dashboard', order: 2, content_type: 'text_with_image' },
    ]
  },
  {
    id: 'COURSE-005',
    name: 'Emergency Response',
    course_name_en: 'Emergency Response',
    course_name_sw: 'Mwitikio wa Dharura',
    description_en: 'How to handle road emergencies',
    description_sw: 'Jinsi ya kukabiliana na dharura barabarani',
    total_lessons: 8,
    duration_hours: 3,
    level: 'Intermediate',
    course_category: 'Safety',
    course_track: 'elimika',
    is_active: 1,
    is_free: 0,
    price: 10000,
    published_date: '2024-03-01',
    status: 'Published',
    thumbnail: 'courses/COURSE-005/thumbnail.png',
    thumbnail_emoji: '🚨',
    lessons: [
      { id: 'LESSON-005-01', title_en: 'First Aid for Drivers', title_sw: 'Huduma ya Kwanza kwa Madereva', order: 1, content_type: 'video' },
      { id: 'LESSON-005-02', title_en: 'Handling a Tire Blowout', title_sw: 'Kukabiliana na Mpasuko wa Tairi', order: 2, content_type: 'text_with_image' },
    ]
  },
  {
    id: 'COURSE-006',
    name: 'Commercial Driving',
    course_name_en: 'Commercial Driving',
    course_name_sw: 'Uendeshaji wa Kibiashara',
    description_en: 'Professional driving for commercial vehicles',
    description_sw: 'Uendeshaji wa kitaalamu kwa magari ya kibiashara',
    total_lessons: 20,
    duration_hours: 8,
    level: 'Advanced',
    course_category: 'Professional',
    course_track: 'elimika',
    is_active: 1,
    is_free: 0,
    price: 25000,
    published_date: '2024-03-15',
    status: 'Published',
    thumbnail: 'courses/COURSE-006/thumbnail.png',
    thumbnail_emoji: '🚚',
    lessons: [
        { id: 'LESSON-006-01', title_en: 'Logbook and Hours of Service', title_sw: 'Kitabu cha Kumbukumbu na Saa za Huduma', order: 1, content_type: 'text' },
        { id: 'LESSON-006-02', title_en: 'Cargo Securement', title_sw: 'Ufungaji Salama wa Mizigo', order: 2, content_type: 'video' },
    ]
  }
];

const seedCoursesAndLessons = async () => {
  console.log('--- Starting to seed courses and lessons ---');
  const batch = db.batch();

  for (const course of coursesData) {
    const { lessons, ...courseData } = course;
    const courseRef = db.collection('courses').doc(course.id);
    
    console.log(`  - Queuing course: ${course.id} (${course.name})`);
    batch.set(courseRef, courseData);

    for (const [index, lesson] of lessons.entries()) {
      const lessonRef = db.collection('lessons').doc(lesson.id);
      console.log(`    - Queuing lesson: ${lesson.id} (${lesson.title_en}) for course ${course.id}`);
      
      const lessonData = {
        name: `Lesson ${lesson.order}`,
        lesson_title_en: lesson.title_en,
        lesson_title_sw: lesson.title_sw,
        course: course.id, // Link to the course
        lesson_order: lesson.order,
        content_type: lesson.content_type,
        is_active: 1,
        is_locked: lesson.order === 1 ? 0 : 1,
        duration_minutes: 20, // Default duration
        summary_en: `This is a summary for ${lesson.title_en}`,
        summary_sw: `Huu ni muhtasari wa ${lesson.title_sw}`,
        content_en: `This is the main content for ${lesson.title_en}. Here, you would have a more detailed explanation of the lesson topic.`,
        content_sw: `Hii ni maudhui kuu ya ${lesson.title_sw}. Hapa, utapata maelezo ya kina zaidi kuhusu mada ya somo.`,
        image_url: lesson.content_type.includes('image') ? `lessons/${lesson.id}/image.png` : null,
        video_url: lesson.content_type.includes('video') ? `lessons/${lesson.id}/video.mp4` : null,
      };

      // Add prerequisite link for lessons that are not the first one
      if (index > 0) {
        const previousLesson = lessons[index - 1];
        lessonData.unlock_after_lesson = previousLesson.id;
      }

      batch.set(lessonRef, lessonData);
    }
  }

  try {
    await batch.commit();
    console.log('\n✅ Successfully seeded all courses and their initial lessons!');
  } catch (error) {
    console.error('\n❌ Error committing batch:', error);
  } finally {
    // Terminate the script
    admin.app().delete();
  }
};

seedCoursesAndLessons();
