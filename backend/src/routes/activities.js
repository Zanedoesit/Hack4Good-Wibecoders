const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.title, a.description, a.date, a.time, a.location, a.capacity,
              COUNT(s.id) as signup_count
       FROM activities a
       LEFT JOIN signups s ON a.id = s.activity_id
       GROUP BY a.id
       ORDER BY a.date ASC`
    );
    const activities = result.rows.map(a => ({
      ...a,
      spots_left: a.capacity - a.signup_count
    }));
    res.json(activities);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, description, date, time, location, capacity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO activities (title, description, date, time, location, capacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, date, time, location, capacity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;