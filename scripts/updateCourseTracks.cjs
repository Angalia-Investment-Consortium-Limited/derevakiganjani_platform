
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
} catch(e) {
    if (e.code !== 'app/duplicate-app') {
        console.error('Firebase admin initialization error', e);
        process.exit(1);
    }
}

const db = admin.firestore();

const updateCourseTracks = async () => {
  console.log('--- Starting Course Track update process ---');
  const coursesRef = db.collection('Course');
  const snapshot = await coursesRef.get();
  const batch = db.batch();
  let updates = 0;

  if (snapshot.empty) {
    console.log('No courses found.');
    return;
  }

  snapshot.forEach(doc => {
    const course = doc.data();
    const courseId = doc.id;
    let newTrack = null;

    // Check if the course is a test based on its ID structure or name
    if (courseId.includes('-test') || (course.course_name_en && course.course_name_en.toLowerCase().includes('self-assessment'))) {
        if (course.course_track !== 'jitesti') {
            newTrack = 'jitesti';
            console.log(`  - Queuing update for ${courseId}: track -> jitesti`);
        }
    } else {
        if (course.course_track !== 'elimika') {
            newTrack = 'elimika';
            console.log(`  - Queuing update for ${courseId}: track -> elimika`);
        }
    }

    if (newTrack) {
        batch.update(doc.ref, { course_track: newTrack });
        updates++;
    }
  });

  if (updates > 0) {
    console.log(`\nCommitting ${updates} track updates...`);
    await batch.commit();
    console.log('✅ Course tracks updated successfully!');
  } else {
    console.log('No course tracks required updating.');
  }
  
  console.log('--- Course Track update process complete ---');
};

updateCourseTracks().catch(console.error).finally(() => admin.app().delete());
