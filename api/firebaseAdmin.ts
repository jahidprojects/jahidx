import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const initAdmin = () => {
  if (getApps().length > 0) return getFirestore();

  let credential;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
      );
      credential = cert(serviceAccount);
    } else {
      console.warn("⚠️  WARNING: Firebase Admin credentials not found. Secure writes will fail.");
    }
  } catch (err) {
    console.error("Failed to parse Firebase Admin credentials:", err);
  }

  initializeApp(credential ? { credential } : undefined);
  return getFirestore();
};

export const adminDb = initAdmin();
