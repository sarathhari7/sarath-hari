const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase initialized successfully');
    }
    return admin.firestore();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

module.exports = { initializeFirebase };
