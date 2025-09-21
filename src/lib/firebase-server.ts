import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Firestore as FirebaseFirestore } from 'firebase-admin/firestore' // Import Firestore
import { getAuth } from 'firebase-admin/auth'

// Firebase Admin Configuration
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
}

// Initialize Firebase Admin
let adminApp: any
let adminDb: any
let adminAuth: any

const hasFirebaseCredentials =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasFirebaseCredentials) {
  if (!getApps().length) {
    adminApp = initializeApp(firebaseAdminConfig)
    adminDb = getFirestore(adminApp)
    adminAuth = getAuth(adminApp)
  } else {
    adminApp = getApps()[0]
    adminDb = getFirestore(adminApp)
    adminAuth = getAuth(adminApp)
  }

  // Add a robust check for adminDb
  if (adminDb && !(adminDb instanceof FirebaseFirestore)) {
    console.error("adminDb is not an instance of FirebaseFirestore. Actual type:", typeof adminDb, adminDb);
    // You might want to throw an error here to stop the build
    // throw new Error("Firebase Admin SDK Firestore instance is invalid.");
  } else if (!adminDb) {
    console.error("adminDb is null or undefined after initialization.");
  } else {
    console.log("Firebase Admin SDK Firestore (adminDb) initialized successfully and is a valid instance.");
  }

} else {
  console.warn("Firebase Admin SDK not initialized: Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
}

export { adminDb, adminAuth, adminApp }