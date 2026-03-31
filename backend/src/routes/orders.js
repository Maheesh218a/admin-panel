import express from 'express';
import { db } from '../config/firebase.js';

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('order_date', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: 'success', data: orders });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ status: 'error', message: 'Order not found' });
    res.json({ status: 'success', data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('orders').doc(req.params.id).update({ status, updatedAt: new Date() });
    res.json({ status: 'success', message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).delete();
    res.json({ status: 'success', message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
