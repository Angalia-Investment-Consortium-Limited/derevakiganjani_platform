const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function debugShortlist() {
    const db = admin.firestore();
    const shortlists = await db.collection('shortlists').get();
    
    console.log(`Found ${shortlists.size} shortlisted drivers.`);
    shortlists.forEach(doc => {
        console.log(doc.id, doc.data());
    });
    
    // Check job and employer IDs.
    const jobs = await db.collection('jobs').limit(5).get();
    jobs.forEach(doc => {
        const d = doc.data();
        console.log(`Job ${doc.id}: title=${d.job_title}, employerId=${d.employerId}, companyName=${d.company_name}`);
    });
}

debugShortlist().catch(console.error);
