const express = require('express');
const { pool } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireRole('caregiver'), async (req, res) => {
  const caregiverId = req.user.id;
  const activityId = req.query.activity_id ? parseInt(req.query.activity_id, 10) : null;

  try {
    if (activityId) {
      const result = await pool.query(
        `SELECT i.id, i.name, i.age, i.special_needs,
                (s.id IS NOT NULL) as already_registered
         FROM individuals i
         LEFT JOIN signups s
           ON s.individual_id = i.id
          AND s.activity_id = $2
          AND s.caregiver_id = $1
         WHERE i.caregiver_id = $1
         ORDER BY i.created_at ASC`,
        [caregiverId, activityId]
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      `SELECT i.id, i.name, i.age, i.special_needs
       FROM individuals i
       WHERE i.caregiver_id = $1
       ORDER BY i.created_at ASC`,
      [caregiverId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', authMiddleware, requireRole('caregiver'), async (req, res) => {
  const caregiverId = req.user.id;
  const { name, age, special_needs } = req.body;

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM individuals WHERE caregiver_id = $1',
      [caregiverId]
    );
    if ((countResult.rows[0]?.count || 0) >= 5) {
      return res.status(400).json({ error: 'Maximum of five individuals allowed' });
    }
    const result = await pool.query(
      `INSERT INTO individuals (caregiver_id, name, age, special_needs)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, age, special_needs`,
      [caregiverId, name, age || null, special_needs || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, requireRole('caregiver'), async (req, res) => {
  const caregiverId = req.user.id;
  const individualId = parseInt(req.params.id, 10);
  const { name, age, special_needs } = req.body;

  try {
    const result = await pool.query(
      `UPDATE individuals
       SET name = $1, age = $2, special_needs = $3
       WHERE id = $4 AND caregiver_id = $5
       RETURNING id, name, age, special_needs`,
      [name, age || null, special_needs || null, individualId, caregiverId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, requireRole('caregiver'), async (req, res) => {
  const caregiverId = req.user.id;
  const individualId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(
      'DELETE FROM individuals WHERE id = $1 AND caregiver_id = $2 RETURNING id',
      [individualId, caregiverId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Individual not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
