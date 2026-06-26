import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized.
//
// Two credential modes are supported automatically:
//  1. Explicit service-account key (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)
//     — used for local development and any host where you paste the key.
//  2. Application Default Credentials (no key needed) — used automatically when
//     running inside the same Google project (e.g. Firebase App Hosting /
//     Cloud Run). This is the recommended production setup: there is no private
//     key to store or rotate.
if (!admin.apps.length) {
  try {
    const projectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT;

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

    if (clientEmail && privateKey) {
      // Mode 1: explicit service-account credentials.
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        ...(databaseURL ? { databaseURL } : {}),
      });
      console.log('✅ Firebase Admin SDK initialized (service-account key)');
      console.log('📋 Project ID:', projectId);
    } else {
      // Mode 2: Application Default Credentials (same-project hosting).
      admin.initializeApp({
        ...(projectId ? { projectId } : {}),
        ...(databaseURL ? { databaseURL } : {}),
      });
      console.log('✅ Firebase Admin SDK initialized (Application Default Credentials)');
      console.log('📋 Project ID:', projectId || '(from runtime environment)');
    }
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    throw error;
  }
}

// Export Firebase Admin services with error handling
export const firestore = admin.firestore();
export const auth = admin.auth();
export const adminApp = admin.app();

// Helper function to test Firestore connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Try to read from a test collection
    const testDoc = await firestore.collection('test').limit(1).get();
    console.log('✅ Firestore connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    return false;
  }
}

export default admin;
