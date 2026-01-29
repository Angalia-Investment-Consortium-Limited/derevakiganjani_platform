
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// --- Data Definitions ---

const driverProfile = {
    driverId: "TEST_DRIVER_ID_AJIRA",
    fullName: "Baraka Juma",
    bio: "Professional driver with 7+ years of experience in corporate and VIP transportation. Strong knowledge of Dar es Salaam and Arusha routes. Committed to safety and punctuality.",
    skills: ["Defensive Driving", "VIP Client Service", "Route Navigation", "Basic Vehicle Maintenance"],
    experience: [
      {
        title: "VIP Driver",
        company: "Corporate Executive Services",
        years: "2018-Present"
      }
    ],
    licenseClass: "C1",
    availability: "Available Immediately",
    region: "Dar es Salaam",
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
};

const job = {
    employerId: "TEST_EMPLOYER_ID_AJIRA",
    job_title: "Executive Chauffeur for CEO",
    job_description: "We are seeking a highly professional and experienced chauffeur to provide transportation for our company CEO. The ideal candidate will be discreet, reliable, and have an impeccable driving record.",
    region: "Dar es Salaam",
    required_license_class: "C1",
    required_skills: ["VIP Client Service", "Defensive Driving", "Fluent in English"],
    employment_type: "Full-time",
    salary_range: "1,200,000 - 1,800,000 TZS",
    status: "Open",
    posted_date: admin.firestore.FieldValue.serverTimestamp()
};


// --- Seeding Logic ---

const seedAjiraModule = async () => {
  try {
    console.log("Starting Ajira ya Udereva module seeding...");

    // 1. Seed Driver Profile
    const profileRef = db.collection('driver_profiles').doc(driverProfile.driverId);
    await profileRef.set(driverProfile);
    console.log(`-> Seeded driver profile for: ${driverProfile.fullName} (${profileRef.id})`);

    // 2. Seed Job
    const jobRef = await db.collection('jobs').add(job);
    console.log(`-> Seeded job: "${job.job_title}" (${jobRef.id})`);

    // 3. Seed Job Application
    const application = {
        jobId: jobRef.id,
        driverId: profileRef.id,
        employerId: job.employerId,
        application_date: admin.firestore.FieldValue.serverTimestamp(),
        status: "Applied"
    };
    const applicationRef = await db.collection('job_applications').add(application);
    console.log(`-> Seeded application: ${applicationRef.id} (Driver ${profileRef.id} for Job ${jobRef.id})`);

    console.log("\nSeeding for Ajira ya Udereva module completed successfully!");

  } catch (error) {
    console.error("\nError seeding Ajira module:", error);
  }
};

seedAjiraModule();
