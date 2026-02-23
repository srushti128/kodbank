const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { uid, username, email, password, phone, role } = req.body;

  // Validation
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Only Customer role allowed
  if (role && role !== 'Customer') {
    return res.status(403).json({ success: false, message: 'Only Customer role is allowed for registration.' });
  }

  try {
    // Check if username or email exists
    const [existing] = await pool.execute(
      'SELECT uid FROM KodUser WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or email already exists.' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate UID if not provided
    const userId = uid || uuidv4();

    // Insert user with default balance 100000
    await pool.execute(
      'INSERT INTO KodUser (uid, username, email, password, balance, phone, role) VALUES (?, ?, ?, ?, 100000.00, ?, ?)',
      [userId, username, email, hashedPassword, phone, 'Customer']
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Kodbank.',
      redirect: '/login'
    });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    // Fetch user from DB
    const [users] = await pool.execute(
      'SELECT * FROM KodUser WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // Generate JWT
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign(
      {
        sub: user.username,       // Subject: username
        role: user.role,          // Claim: role
        uid: user.uid
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Calculate expiry datetime
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in UserToken table
    await pool.execute(
      'INSERT INTO UserToken (tid, token, uid, expiry) VALUES (?, ?, ?, ?)',
      [uuidv4(), token, user.uid, expiry]
    );

    // Set token in cookie
    res.cookie('kodbank_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: token,
      redirect: '/userdashboard'
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('kodbank_token');
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
