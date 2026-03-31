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

async function backfillProducts() {
  console.log('Starting product field backfill...');
  try {
    const snapshot = await db.collection('products').get();
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const updates = {};
      
      // Add createdAt if missing
      if (!data.createdAt) {
        // Use a staggered date so they have some order (each 1 min apart)
        const date = new Date();
        date.setMinutes(date.getMinutes() - (snapshot.size - index));
        updates.createdAt = date;
      }
      
      // Ensure status is true
      if (data.status === undefined) {
        updates.status = true;
      }
      
      // Ensure badge exists
      if (!data.badge) {
        updates.badge = 'New';
      }
      
      // Ensure price fields are numbers
      if (typeof data.price === 'string') updates.price = parseFloat(data.price) || 0;
      if (typeof data.original_price === 'string') updates.original_price = parseFloat(data.original_price) || 0;
      if (typeof data.stock === 'string') updates.stock = parseInt(data.stock) || 0;

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
        count++;
      }
    });
    
    await batch.commit();
    console.log(`Successfully backfilled fields for ${count} products.`);
  } catch (error) {
    console.error('Error backfilling products:', error);
  } finally {
    process.exit();
  }
}

backfillProducts();
