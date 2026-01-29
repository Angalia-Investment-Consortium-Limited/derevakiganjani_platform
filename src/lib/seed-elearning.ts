import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const seedCourses = async () => {
    const coursesCollection = collection(db, 'courses');
    const courseData = {
        course_name_en: "Road Safety Fundamentals",
        course_name_sw: "Misingi ya Usalama Barabarani",
        description_en: "Master essential road safety rules and become a safer driver on the road.",
        description_sw: "Jifunze sheria muhimu za usalama barabarani na uwe dereva salama zaidi.",
        course_category: "basic",
        level: "Basic",
        duration_hours: 4,
        thumbnail_emoji: "🚦",
        is_free: true,
        total_lessons: 10,
        status: "Published"
    };
    const courseDoc = await addDoc(coursesCollection, courseData);
    console.log('Seeded course:', courseDoc.id);
    return courseDoc.id;
};

const seedEnrollment = async (courseId: string, driverId: string) => {
    const enrollmentsCollection = collection(db, 'course_enrollments');
    const enrollmentData = {
        driverId: driverId,
        courseId: courseId,
        enrollment_date: new Date(),
        status: "In Progress",
        progress_percentage: 40,
        completed_lessons: 4,
        total_lessons: 10,
        last_accessed: new Date(),
        completion_date: null,
        certificate_issued: null
    };
    const enrollmentDoc = await addDoc(enrollmentsCollection, enrollmentData);
    console.log('Seeded enrollment:', enrollmentDoc.id);
    return enrollmentDoc.id;
}

const seedCertificate = async (courseId: string, driverId: string, enrollmentId: string) => {
    const certificatesCollection = collection(db, 'certificates');
    const certificateData = {
        driverId: driverId,
        courseId: courseId,
        enrollmentId: enrollmentId,
        course_name: "Road Safety Fundamentals",
        issue_date: new Date(),
        certificate_url: `https://example.com/certificates/${enrollmentId}`
    };
    await addDoc(certificatesCollection, certificateData);
    console.log('Seeded certificate for enrollment:', enrollmentId);
}

const seedAll = async () => {
    try {
        console.log('Starting database seeding...');
        const driverId = 'TEST_DRIVER_ID'; // Using a placeholder driver ID
        const courseId = await seedCourses();
        const enrollmentId = await seedEnrollment(courseId, driverId);
        // Example of seeding a completed course with a certificate
        const completedEnrollmentData = {
            driverId: driverId,
            courseId: courseId,
            enrollment_date: new Date(),
            status: "Completed",
            progress_percentage: 100,
            completed_lessons: 10,
            total_lessons: 10,
            last_accessed: new Date(),
            completion_date: new Date(),
            certificate_issued: null
        };
        const completedEnrollmentDoc = await addDoc(collection(db, 'course_enrollments'), completedEnrollmentData);
        await seedCertificate(courseId, driverId, completedEnrollmentDoc.id);
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedAll();
