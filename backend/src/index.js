import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/firebase.js';

// Import routes
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import bannersRouter from './routes/banners.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', async (req, res) => {
  try {
    // Test Firestore connection
    await db.listCollections();
    res.json({
      status: 'success',
      message: '✅ Shofyra Backend is running & Firebase connected!',
      project: process.env.FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '❌ Firebase connection failed',
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/banners', bannersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Shofyra Backend running on http://localhost:${PORT}`);
  console.log(`📦 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🔥 Firebase Admin SDK initialized\n`);
});
