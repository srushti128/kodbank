const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.kodbank_token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided. Please login.' });
    }

    // Verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }

    // Check token exists in DB
    const [rows] = await pool.execute(
      'SELECT * FROM UserToken WHERE token = ? AND expiry > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Token not found or expired in database.' });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Token verification failed.' });
  }
};

module.exports = { verifyToken };
