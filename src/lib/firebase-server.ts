import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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

if (!getApps().length) {
  adminApp = initializeApp(firebaseAdminConfig)
  adminDb = getFirestore(adminApp)
  adminAuth = getAuth(adminApp)
} else {
  adminApp = getApps()[0]
  adminDb = getFirestore(adminApp)
  adminAuth = getAuth(adminApp)
}

export { adminDb, adminAuth, adminApp }