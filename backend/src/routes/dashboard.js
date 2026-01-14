const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/signups', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id as activity_id,
        a.title,
        a.date,
        a.time,
        COUNT(s.id) as signup_count,
        json_agg(
          json_build_object(
            'individual_id', i.id,
            'individual_name', i.name,
            'caregiver_name', u.name,
            'caregiver_email', u.email
          )
        ) as individuals
      FROM activities a
      LEFT JOIN signups s ON a.id = s.activity_id
      LEFT JOIN individuals i ON s.individual_id = i.id
      LEFT JOIN users u ON s.caregiver_id = u.id
      GROUP BY a.id, a.title, a.date, a.time
      ORDER BY a.date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;