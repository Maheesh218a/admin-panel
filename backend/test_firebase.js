import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccount.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'eshopapp-b04f9',
});

const db = admin.firestore();

async function test() {
  const collections = await db.listCollections();
  console.log('Collections:', collections.map(c => c.id));
  
  const ordersRef = db.collection('orders');
  const snapshot = await ordersRef.limit(1).get();
  console.log('Orders count (limit 1):', snapshot.size);
  if (snapshot.size > 0) {
      console.log('First order data:', snapshot.docs[0].data());
  }
}

test().catch(console.error);
