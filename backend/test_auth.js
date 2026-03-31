import { auth } from './src/config/firebase.js';

async function listAllUsers() {
  try {
    const listResult = await auth.listUsers();
    listResult.users.forEach((userRecord) => {
      console.log('User found:', userRecord.uid, userRecord.metadata.creationTime);
    });
  } catch (error) {
    console.log('Error listing users:', error);
  }
}

listAllUsers();
