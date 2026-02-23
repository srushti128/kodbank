const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create tables if they don't exist
async function initializeDB() {
  const conn = await pool.getConnection();
  try {
    // KodUser table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS KodUser (
        uid VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 100000.00,
        phone VARCHAR(20),
        role ENUM('Customer','Manager','Admin') DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // UserToken table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS UserToken (
        tid VARCHAR(36) PRIMARY KEY,
        token TEXT NOT NULL,
        uid VARCHAR(36) NOT NULL,
        expiry DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ DB Init Error:', err.message);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, initializeDB };
