import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

// GET all Categories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').orderBy('sort_order', 'asc').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: 'success', data: categories });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single category
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('categories').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Category not found' });
    res.json({ status: 'success', data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create category
router.post('/', async (req, res) => {
  try {
    const { id, name, icon, color_hex, sort_order, status } = req.body;
    const slug = id || name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
    
    await db.collection('categories').doc(slug).set({
      id: slug,
      name,
      icon,
      color_hex: color_hex || '#000000',
      sort_order: parseInt(sort_order) || 0,
      status: status !== undefined ? status : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ status: 'success', id: slug });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color_hex, sort_order, status } = req.body;
    await db.collection('categories').doc(req.params.id).update({
      name,
      icon,
      color_hex,
      sort_order: parseInt(sort_order),
      status,
      updatedAt: new Date(),
    });
    res.json({ status: 'success', message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE category (though UI is removed, keep for API sanity)
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('categories').doc(req.params.id).delete();
    res.json({ status: 'success', message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
