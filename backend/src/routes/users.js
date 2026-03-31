import express from 'express';
import { db, auth } from '../config/firebase.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const firestoreUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch Auth metadata to get registration date
    try {
      const authUsers = await auth.listUsers();
      const merged = firestoreUsers.map(fUser => {
        const aUser = authUsers.users.find(u => u.uid === (fUser.uid || fUser.id));
        return {
          ...fUser,
          registerDate: aUser?.metadata?.creationTime || fUser.createdAt || null
        };
      });
      res.json({ status: 'success', data: merged });
    } catch (authError) {
      console.error('Auth metadata fetch failed:', authError);
      res.json({ status: 'success', data: firestoreUsers });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, role, status, password } = req.body;
    
    // Create User in Firebase Auth
    const authUser = await auth.createUser({
      email,
      password: password || 'Welcome123!',
      displayName: name,
    });

    // Store details in Firestore
    await db.collection('users').doc(authUser.uid).set({
      uid: authUser.uid,
      name,
      email,
      phone: phone || '',
      role: role || 'Customer',
      status: status !== undefined ? status : true,
      createdAt: new Date(),
    });

    res.status(201).json({ status: 'success', id: authUser.uid });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, role, status } = req.body;
    await db.collection('users').doc(req.params.id).update({
      name,
      phone,
      role,
      status,
      updatedAt: new Date(),
    });
    
    // Optionally update Auth display name
    try { await auth.updateUser(req.params.id, { displayName: name }); } catch (_) { }

    res.json({ status: 'success', message: 'User updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    // Also delete from Firebase Auth
    try { await auth.deleteUser(req.params.id); } catch (_) { }
    res.json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
