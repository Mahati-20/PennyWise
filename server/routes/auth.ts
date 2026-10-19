import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, mode = 'campus' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMode = mode === 'pro' ? 'pro' : 'campus';

    // Check if email already registered
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Transaction to insert user and initial profile
    const insertUser = db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `).run(userId, cleanEmail, passwordHash, now);

      db.prepare(`
        INSERT INTO profiles (
          user_id, name, mode, currency, college_or_company,
          starting_balance, monthly_income, income_source, allowance_frequency,
          budget_preference, onboarding_completed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name.trim(),
        cleanMode,
        cleanMode === 'campus' ? 'INR' : 'USD',
        '',
        0,
        0,
        '',
        'monthly',
        'monthly',
        0,
        now,
        now
      );
    });

    insertUser();

    // Establish session
    req.session.userId = userId;
    req.session.email = cleanEmail;

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

    return res.status(201).json({
      user: { id: userId, email: cleanEmail, name: name.trim(), mode: cleanMode },
      profile,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);

    return res.json({
      user: { id: user.id, email: user.email },
      profile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('pennywise.sid', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return res.json({ message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me (Session restoration)
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.session || !req.session.userId) {
    return res.json({ user: null, profile: null });
  }

  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.session.userId) as any;
  if (!user) {
    req.session.destroy(() => {});
    return res.json({ user: null, profile: null });
  }

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);

  return res.json({
    user,
    profile,
  });
});

export default router;

