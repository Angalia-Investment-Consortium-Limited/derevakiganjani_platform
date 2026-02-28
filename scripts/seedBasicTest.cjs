
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');
  const serviceAccountRaw = fs.readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountRaw);
  
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      private_key: privateKey,
    }),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK. Make sure the serviceAccountKey.json file is present in the scripts directory.', error);
  process.exit(1);
}

const db = admin.firestore();
