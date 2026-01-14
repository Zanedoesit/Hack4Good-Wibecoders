const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/bulk', authMiddleware, async (req, res) => {
  const { activity_id, individual_ids } = req.body;
  const caregiver_id = req.user.id;

  try {
    const signups = [];
    for (const ind_id of individual_ids) {
      const result = await pool.query(
        `INSERT INTO signups (activity_id, individual_id, caregiver_id, status)
         VALUES ($1, $2, $3, 'registered')
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [activity_id, ind_id, caregiver_id]
      );
      if (result.rows.length > 0) signups.push(result.rows[0]);
    }
    res.json({ success: true, signups_created: signups.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;