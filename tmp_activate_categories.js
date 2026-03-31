import { db } from './backend/src/config/firebase.js';

async function activateAllCategories() {
  try {
    const snapshot = await db.collection('categories').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
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
