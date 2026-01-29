
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const jobs = [
    {
        title: 'Company Driver',
        employerName: 'ABC Company',
        licenseRequired: 'C',
        location: 'Dar es Salaam, Tanzania',
        vehicleType: 'Car',
        jobType: 'Full-time',
        salary: 'TZS 800,000 - 1,200,000',
        postedOn: new Date(),
        employerId: 'some-employer-id' // Replace with a real employer ID
    },
];

const seedJobs = async () => {
  const jobsCollection = db.collection('jobs');
  for (const job of jobs) {
    await jobsCollection.add(job);
    console.log(`Added job: ${job.title}`);
  }
};

seedJobs().then(() => console.log('Seeding complete'));
