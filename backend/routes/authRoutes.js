import express from 'express';
import { query } from '../db/client.js';
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

router.post('/demo-login', async (req, res) => {
  const { email, role, password } = req.body;

  if (!email || !role || !password) {
    return sendError(res, 'Email, password, and role are required', 400);
  }

  if (!['adopter', 'shelter'].includes(role)) {
    return sendError(res, 'Invalid role', 400);
  }

  try {
    const profile = await getProfileByEmail(email);

    if (!profile) {
      return sendError(res, 'No profile found for that email. In demo mode, use an email that already exists in Supabase (adopter@example.com for adopters or shelter@example.com for shelters).', 404);
    }

    if (profile.role !== role) {
      return sendError(
        res,
        `This email belongs to a ${profile.role} profile, not a ${role} profile.`,
        403
      );
    }

    return sendSuccess(res, {
      user: { email: profile.email, role: profile.role },
      token: `demo-token-${profile.role}`,
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to log in');
  }
});

export default router;