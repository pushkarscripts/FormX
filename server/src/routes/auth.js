import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

function validateCredentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !email.includes('@') || !email.includes('.') || !password || password.length < 8) {
    return null;
  }
  return { email, password };
}

function issueToken(admin) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }
  return jwt.sign({ sub: admin._id.toString() }, secret, { expiresIn: '1d' });
}

function requireJwtSecret(res) {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ error: 'JWT_SECRET is not configured' });
    return false;
  }
  return true;
}

router.post('/register', async (req, res, next) => {
  if (!requireJwtSecret(res)) return;
  const credentials = validateCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({ error: 'A valid email and password of at least 8 characters are required' });
  }

  try {
    const existing = await Admin.findOne({ email: credentials.email });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    const password = await bcrypt.hash(credentials.password, 12);
    const admin = await Admin.create({ email: credentials.email, password });
    return res.status(201).json({
      admin: { id: admin.id, email: admin.email },
      token: issueToken(admin)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  if (!requireJwtSecret(res)) return;
  const credentials = validateCredentials(req.body);
  if (!credentials) {
    return res.status(400).json({ error: 'A valid email and password of at least 8 characters are required' });
  }

  try {
    const admin = await Admin.findOne({ email: credentials.email }).select('+password');
    if (!admin || !(await bcrypt.compare(credentials.password, admin.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.status(200).json({
      admin: { id: admin.id, email: admin.email },
      token: issueToken(admin)
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
