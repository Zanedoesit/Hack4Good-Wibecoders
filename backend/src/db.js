const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'minds_db',
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(50),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS individuals (
        id SERIAL PRIMARY KEY,
        caregiver_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        special_needs TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255),
        capacity INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER REFERENCES activities(id),
        individual_id INTEGER REFERENCES individuals(id),
        caregiver_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(activity_id, individual_id)
      );

      CREATE INDEX IF NOT EXISTS idx_signups_activity ON signups(activity_id);
      CREATE INDEX IF NOT EXISTS idx_signups_caregiver ON signups(caregiver_id);
      CREATE INDEX IF NOT EXISTS idx_individuals_caregiver ON individuals(caregiver_id);
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('DB init error:', err);
  }
};

module.exports = { pool, initDb };