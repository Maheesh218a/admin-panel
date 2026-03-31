import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: 'success', data: products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Product not found' });
    res.json({ status: 'success', data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const docRef = await db.collection('products').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).update({ ...req.body, updatedAt: new Date() });
    res.json({ status: 'success', message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).delete();
    res.json({ status: 'success', message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
