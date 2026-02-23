const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/user/balance - Protected route
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const username = req.user.sub; // Extract username from JWT subject

    // Fetch balance from KodUser table
    const [users] = await pool.execute(
      'SELECT username, balance, role FROM KodUser WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      username: user.username,
      balance: user.balance,
      role: user.role,
      token: req.token
    });
  } catch (err) {
    console.error('Balance Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch balance.' });
  }
});

module.exports = router;
