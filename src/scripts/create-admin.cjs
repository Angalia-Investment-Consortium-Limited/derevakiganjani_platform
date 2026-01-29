"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
// NOTE: This script is intended to be run in an environment where process.env variables are loaded.
// You might need to use a package like dotenv to load them from a .env file.
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const auth = (0, auth_1.getAuth)(app);
const db = (0, firestore_1.getFirestore)(app);
const email = 'mdv@aicl.co.tz';
const password = 'Yeshua@2025';
const createAdmin = async () => {
    try {
        console.log(`Attempting to create admin user: ${email}...`);
        const userCredential = await (0, auth_1.createUserWithEmailAndPassword)(auth, email, password);
        const firebaseUser = userCredential.user;
        console.log(`Successfully created user in Firebase Auth with UID: ${firebaseUser.uid}`);
        const userDocRef = (0, firestore_1.doc)(db, 'users', firebaseUser.uid);
        await (0, firestore_1.setDoc)(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            roles: ['admin'],
            createdAt: firestore_1.Timestamp.now(),
        });
        console.log(`Successfully created user document in 'users' collection.`);
        const profileDocRef = (0, firestore_1.doc)(db, 'adminProfiles', firebaseUser.uid);
        await (0, firestore_1.setDoc)(profileDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: 'Admin User',
            createdAt: firestore_1.Timestamp.now(),
        });
        console.log(`Successfully created admin profile in 'adminProfiles' collection.`);
        console.log('\nAdmin user created successfully!');
        // The process needs to exit, otherwise the command will hang
        process.exit(0);
    }
    catch (error) {
        console.error('Error creating admin user:', error.message);
        if (error.code === 'auth/email-already-in-use') {
            console.error('This email address is already in use. Please use a different email.');
        }
        process.exit(1);
    }
};
createAdmin();
