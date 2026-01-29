
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

const employer = {
    userId: "TEST_EMPLOYER_ID_01",
    company_name: "Tanzania Freights",
    company_email: "hr@tzfreights.co.tz",
    company_phone: "+255 755 123 456",
    address: {
        street: "45 Mjini Street",
        city: "Arusha",
        country: "Tanzania"
    },
    industry: "Logistics & Supply Chain",
    website: "https://www.tzfreights.co.tz",
    verificationStatus: "Verified", // 'Pending', 'Verified', 'Rejected'
    account_creation_date: admin.firestore.FieldValue.serverTimestamp()
};

const pendingEmployer = {
    userId: "TEST_EMPLOYER_ID_02",
    company_name: "Pwani Passenger Services",
    company_email: "info@pwanibus.co.tz",
    verificationStatus: "Pending",
    account_creation_date: admin.firestore.FieldValue.serverTimestamp()
};

const jobFromEmployer = {
    employerId: employer.userId, // Link to the verified employer
    job_title: "Long Haul Truck Driver",
    job_description: "Experienced truck driver needed for routes between Dar es Salaam and Mwanza. Must have experience with heavy goods vehicles.",
    region: "Dar es Salaam",
    required_license_class: "E",
    required_skills: ["Heavy Vehicle Operation", "Logbook Maintenance"],
    employment_type: "Full-time",
    status: "Open",
    posted_date: admin.firestore.FieldValue.serverTimestamp()
};

// --- Seeding Logic ---

const seedEmployers = async () => {
  try {
    console.log("Starting Employer module seeding...");

    // 1. Seed a Verified Employer
    await db.collection('employers').doc(employer.userId).set(employer);
    console.log(`-> Seeded 'Verified' employer: ${employer.company_name}`);

    // 2. Seed a Pending Employer
    await db.collection('employers').doc(pendingEmployer.userId).set(pendingEmployer);
    console.log(`-> Seeded 'Pending' employer: ${pendingEmployer.company_name}`);

    // 3. Seed a Job linked to the Verified Employer
    const jobRef = await db.collection('jobs').add(jobFromEmployer);
    console.log(`-> Seeded job "${jobFromEmployer.job_title}" (${jobRef.id}) for ${employer.company_name}`);

    console.log("\nSeeding for Employer module completed successfully!");

  } catch (error) {
    console.error("\nError seeding Employer module:", error);
  }
};

seedEmployers();
