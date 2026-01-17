const express = require('express');
const { pool } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/bulk', authMiddleware, requireRole('caregiver'), async (req, res) => {
  const { activity_id, individual_ids } = req.body;
  const caregiver_id = req.user.id;

  try {
    if (!Array.isArray(individual_ids) || individual_ids.length === 0) {
      return res.status(400).json({ error: 'No individuals selected' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const activityResult = await client.query(
        'SELECT capacity FROM activities WHERE id = $1 FOR UPDATE',
        [activity_id]
      );
      if (activityResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Activity not found' });
      }

      const ownedIndividuals = await client.query(
        'SELECT id FROM individuals WHERE caregiver_id = $1 AND id = ANY($2::int[])',
        [caregiver_id, individual_ids]
      );
      const ownedIds = new Set(ownedIndividuals.rows.map(r => r.id));
      if (ownedIds.size !== individual_ids.length) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'One or more individuals are not yours' });
      }

      const existingResult = await client.query(
        'SELECT individual_id FROM signups WHERE activity_id = $1 AND individual_id = ANY($2::int[])',
        [activity_id, individual_ids]
      );
      const existingIds = new Set(existingResult.rows.map(r => r.individual_id));
      const toCreate = individual_ids.filter(id => !existingIds.has(id));

      const countResult = await client.query(
        'SELECT COUNT(*)::int as signup_count FROM signups WHERE activity_id = $1',
        [activity_id]
      );
      const signupCount = countResult.rows[0]?.signup_count || 0;
      const capacity = activityResult.rows[0].capacity || 0;
      const spotsLeft = capacity - signupCount;

      if (toCreate.length > spotsLeft) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Not enough spots left' });
      }

      const signups = [];
      for (const ind_id of toCreate) {
        const result = await client.query(
          `INSERT INTO signups (activity_id, individual_id, caregiver_id, status)
           VALUES ($1, $2, $3, 'registered')
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [activity_id, ind_id, caregiver_id]
        );
        if (result.rows.length > 0) signups.push(result.rows[0]);
      }

      await client.query('COMMIT');
      res.json({
        success: true,
        signups_created: signups.length,
        already_registered: existingIds.size
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
