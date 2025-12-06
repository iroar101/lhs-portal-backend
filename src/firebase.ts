import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";

// Initialize Firebase Admin exactly once
if (!admin.apps.length) {
  // Preferred: use GOOGLE_APPLICATION_CREDENTIALS loaded via dotenv
  // This will use the service account JSON file at that path
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // If you ever need it:
    // databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const db = admin.firestore();
export { admin };