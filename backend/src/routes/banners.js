import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

// GET all banners
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('banners').orderBy('sort_order', 'asc').get();
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: 'success', data: banners });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST create banner
router.post('/', async (req, res) => {
  try {
    const { id, title, subtitle, label, image_url, cta_text, sort_order, target_category } = req.body;
    
    // Auto-generate slug if not provided (e.g. mega_sale -> banner_mega_sale)
    const slug = id || `banner_${title.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '')}`;

    await db.collection('banners').doc(slug).set({
      id: slug,
      title,
      subtitle: subtitle || '',
      label: label || '',
      image_url,
      cta_text: cta_text || 'Shop Now',
      sort_order: parseInt(sort_order) || 0,
      target_category: target_category || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ status: 'success', id: slug });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update banner
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, label, image_url, cta_text, sort_order, target_category } = req.body;
    await db.collection('banners').doc(req.params.id).update({
      title,
      subtitle: subtitle || '',
      label: label || '',
      image_url,
      cta_text: cta_text || 'Shop Now',
      sort_order: parseInt(sort_order) || 0,
      target_category: target_category || null,
      updatedAt: new Date(),
    });
    res.json({ status: 'success', message: 'Banner updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE banner
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('banners').doc(req.params.id).delete();
    res.json({ status: 'success', message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
