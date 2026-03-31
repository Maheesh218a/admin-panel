import express from 'express';
import nodemailer from 'nodemailer';
import { db } from '../config/firebase.js';

const router = express.Router();

// Helper to send verification email
const sendVerificationCode = async (email, name, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Shofyra Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔐 Your Shofyra Verification Code: ${code}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">Shofyra</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px; font-weight: 500;">Secure Admin Access</p>
        </div>
        <div style="padding: 40px 30px; background-color: white;">
          <h2 style="color: #111827; margin-top: 0; font-size: 24px; font-weight: 700;">Hello, ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We received a sign-in attempt for your Shofyra admin account. Use the code below to complete your verification:
          </p>
          <div style="margin: 40px 0; text-align: center;">
            <div style="display: inline-block; padding: 20px 40px; background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 16px;">
              <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8; font-family: 'Courier New', Courier, monospace;">${code}</span>
            </div>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 0;">
            This code will expire shortly. If you didn't expect this, please ignore this email.
          </p>
        </div>
        <div style="padding: 25px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0; font-weight: 500;">
            © 2026 Shofyra Store Admin Panel<br>
            Sri Lanka • Secure Connection Verified
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// POST /api/auth/login — Step 1: Password Check -> Send Verification Code
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    const snapshot = await db.collection('admin').where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(401).json({ status: 'error', message: 'No admin account found with this email.' });
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    if (adminData.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Incorrect password. Please try again.' });
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save code to database (verification column/field)
    await adminDoc.ref.update({ verification: verificationCode });

    // Send email
    try {
      await sendVerificationCode(email, adminData.name, verificationCode);
    } catch (mailError) {
      console.error('Email error:', mailError);
      return res.status(500).json({ status: 'error', message: 'Failed to send verification email. Please try again.' });
    }

    return res.json({
      status: 'verification_required',
      message: 'Verification code sent to your email.',
      email: email
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error: ' + error.message });
  }
});

// POST /api/auth/verify — Step 2: Code Verification
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ status: 'error', message: 'Email and code are required.' });
    }

    const snapshot = await db.collection('admin').where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(404).json({ status: 'error', message: 'Admin not found.' });
    }

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    if (adminData.verification !== code) {
      return res.status(401).json({ status: 'error', message: 'Invalid verification code.' });
    }

    // Success — clear the code and return admin info
    await adminDoc.ref.update({ verification: null });

    return res.json({
      status: 'success',
      message: 'Login successful!',
      admin: {
        id: adminDoc.id,
        name: adminData.name,
        email: adminData.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Server error: ' + error.message });
  }
});

// POST /api/auth/verify-current-password — Step 1: Current Password Check -> Send OTP
router.post('/verify-current-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    const snapshot = await db.collection('admin').where('email', '==', email).get();

    if (snapshot.empty) return res.status(404).json({ status: 'error', message: 'Admin profile not found.' });

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    if (adminData.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Current password incorrect. Verification failed.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await adminDoc.ref.update({ verification: otp });

    try {
      await sendVerificationCode(email, adminData.name, otp);
      res.json({ status: 'success', message: 'Security code sent to your email.' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Mail server error. Try again later.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/auth/change-password — Step 2: OTP Check -> Update Password
router.post('/change-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const snapshot = await db.collection('admin').where('email', '==', email).get();

    if (snapshot.empty) return res.status(404).json({ status: 'error', message: 'Admin not found.' });

    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();

    if (adminData.verification !== code) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired security code.' });
    }

    await adminDoc.ref.update({ 
      password: newPassword, 
      verification: null,
      updatedAt: new Date()
    });

    res.json({ status: 'success', message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/auth/profile — Update Profile Details
router.put('/profile', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const snapshot = await db.collection('admin').where('email', '==', email).get();

    if (snapshot.empty) return res.status(404).json({ status: 'error', message: 'Admin not found.' });

    await snapshot.docs[0].ref.update({
      name,
      phone: phone || '',
      updatedAt: new Date()
    });

    res.json({ status: 'success', message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ status: 'success', message: 'Logged out successfully.' });
});

export default router;
