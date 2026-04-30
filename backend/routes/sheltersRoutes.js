import express from 'express';
import { query } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

async function getProfileByEmail(email) {
  const result = await query(
    `
    select id, email, role
    from profiles
    where lower(email) = lower($1)
    limit 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

router.get('/me', requireAuth, requireRole(['shelter']), async (req, res) => {
  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    const result = await query(
      `
      select *
      from shelters
      where user_id = $1
      limit 1
      `,
      [profile.id]
    );

    return sendSuccess(res, result.rows[0] || null);
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to fetch shelter');
  }
});

export default router;