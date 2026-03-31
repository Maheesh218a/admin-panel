import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key from backend root
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccount.json'), 'utf8')
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function activateAllCategories() {
  console.log('Starting bulk category activation...');
  try {
    const snapshot = await db.collection('categories').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      console.log(`Activating category: ${doc.data().name}`);
      batch.update(doc.ref, { status: true });
    });
    
    await batch.commit();
    console.log('Successfully activated all categories.');
  } catch (error) {
    console.error('Error activating categories:', error);
  } finally {
    process.exit();
  }
}

activateAllCategories();
