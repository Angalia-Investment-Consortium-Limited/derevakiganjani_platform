
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Data Definitions ---

const course = {
    course_name_en: "Road Safety Fundamentals",
    course_name_sw: "Misingi ya Usalama Barabarani",
    description_en: "Master essential road safety rules and become a safer driver.",
    description_sw: "Jifunze sheria muhimu za usalama barabarani na uwe dereva salama.",
    course_category: "basic",
    level: "Basic",
    duration_hours: 4,
    thumbnail_emoji: "🚦",
    is_free: true,
    total_lessons: 10,
    status: "Published",
    creation: admin.firestore.FieldValue.serverTimestamp()
};

const enrollmentInProgress = {
    driverId: "TEST_DRIVER_ID_1",
    enrollment_date: admin.firestore.Timestamp.fromDate(new Date()),
    status: "In Progress",
    progress_percentage: 40,
    completed_lessons: 4,
    total_lessons: 10,
    last_accessed: admin.firestore.Timestamp.fromDate(new Date()),
    completion_date: null,
    certificate_issued: null
};

const enrollmentCompleted = {
    driverId: "TEST_DRIVER_ID_2",
    enrollment_date: admin.firestore.Timestamp.fromDate(new Date("2023-09-01")),
    status: "Completed",
    progress_percentage: 100,
    completed_lessons: 10,
    total_lessons: 10,
    last_accessed: admin.firestore.Timestamp.fromDate(new Date("2023-09-25")),
    completion_date: admin.firestore.Timestamp.fromDate(new Date("2023-09-25")),
    certificate_issued: null // This will be updated after certificate is created
};

// --- Seeding Logic ---

const seedElimikaModule = async () => {
  try {
    console.log("Starting Elimika module seeding...");

    // 1. Seed Course
    const courseRef = await db.collection('courses').add(course);
    console.log(`-> Seeded course: "Road Safety Fundamentals" (${courseRef.id})`);

    // 2. Seed Enrollments (linking to the new course)
    enrollmentInProgress.courseId = courseRef.id;
    const enrollmentInProgressRef = await db.collection('course_enrollments').add(enrollmentInProgress);
    console.log(`-> Seeded 'In Progress' enrollment: ${enrollmentInProgressRef.id}`);

    enrollmentCompleted.courseId = courseRef.id;
    const enrollmentCompletedRef = await db.collection('course_enrollments').add(enrollmentCompleted);
    console.log(`-> Seeded 'Completed' enrollment: ${enrollmentCompletedRef.id}`);

    // 3. Seed Certificate (for the completed enrollment)
    const certificate = {
        driverId: enrollmentCompleted.driverId,
        courseId: courseRef.id,
        enrollmentId: enrollmentCompletedRef.id,
        course_name: course.course_name_en,
        issue_date: enrollmentCompleted.completion_date,
        certificate_url: `https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/certificates%2F${enrollmentCompletedRef.id}.pdf`
    };
    const certificateRef = await db.collection('certificates').add(certificate);
    console.log(`-> Seeded certificate: ${certificateRef.id}`);

    // 4. Update the completed enrollment with the certificate ID
    await db.collection('course_enrollments').doc(enrollmentCompletedRef.id).update({
        certificate_issued: certificateRef.id
    });
    console.log(`-> Updated enrollment ${enrollmentCompletedRef.id} with certificate ID.`);


    console.log("\nSeeding for Elimika module completed successfully!");

  } catch (error) {
    console.error("\nError seeding Elimika module:", error);
  }
};

seedElimikaModule();
