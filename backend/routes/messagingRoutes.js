import express from 'express';
import { query } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
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

async function getShelterByUserId(userId) {
  const result = await query(
    `
    select *
    from shelters
    where user_id = $1
    limit 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function getUserContext(email) {
  const profile = await getProfileByEmail(email);

  if (!profile) {
    return { error: 'Profile not found', status: 404 };
  }

  let shelter = null;

  if (String(profile.role).toLowerCase() === 'shelter') {
    shelter = await getShelterByUserId(profile.id);

    if (!shelter) {
      return { error: 'Shelter record not found', status: 404 };
    }
  }

  return { profile, shelter };
}

async function getThreadForUser(threadId, profileId, shelterId = null) {
  const result = await query(
    `
    select *
    from message_threads
    where id = $1
      and (
        adopter_id = $2
        or shelter_id = $3
      )
    limit 1
    `,
    [threadId, profileId, shelterId]
  );

  return result.rows[0] || null;
}

router.get('/threads', requireAuth, async (req, res) => {
  try {
    const userContext = await getUserContext(req.user.email);

    if (userContext.error) {
      return sendError(res, userContext.error, userContext.status);
    }

    const { profile, shelter } = userContext;

    const result = await query(
      `
      select
        mt.*,
        shelter.user_id as shelter_user_id,
        (
          select count(*)
          from messages m
          where m.thread_id = mt.id
            and m.read = false
            and m.sender_id != $1
        ) as unread_count,

        case
          when mt.adopter_id = $1
            then coalesce(shelter_profile.full_name, shelter.organization_name, shelter.email)
          else coalesce(adopter_profile.full_name, adopter_profile.email)
        end as other_party_name,
        (
          select m.content
          from messages m
          where m.thread_id = mt.id
          order by m.created_at desc
          limit 1
        ) as last_message
      from message_threads mt
      left join profiles adopter_profile
        on adopter_profile.id = mt.adopter_id
      left join shelters shelter
        on shelter.id = mt.shelter_id
      left join profiles shelter_profile
        on shelter_profile.id = shelter.user_id
      where mt.adopter_id = $1
         or mt.shelter_id = $2
      order by mt.updated_at desc nulls last, mt.created_at desc
      `,
      [profile.id, shelter?.id || null]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Failed to fetch threads:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
    });

    return sendError(res, 'Failed to fetch threads');
  }
});

router.get('/threads/:id', requireAuth, async (req, res) => {
  try {
    const userContext = await getUserContext(req.user.email);

    if (userContext.error) {
      return sendError(res, userContext.error, userContext.status);
    }

    const { profile, shelter } = userContext;

    const thread = await getThreadForUser(req.params.id, profile.id, shelter?.id || null);

    if (!thread) {
      return sendError(res, 'Thread not found', 404);
    }

    const result = await query(
      `
      select *
      from messages
      where thread_id = $1
      order by created_at asc
      `,
      [req.params.id]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Failed to fetch messages:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
    });

    return sendError(res, 'Failed to fetch messages');
  }
});

router.patch('/threads/:id/read', requireAuth, async (req, res) => {
    const userContext = await getUserContext(req.user.email);
    const { profile } = userContext;

    await query(
      `
      update messages
      set read = true
      where thread_id = $1
        and sender_id != $2
        and read = false
      `,
      [req.params.id, profile.id]
    );

    return sendSuccess(res, { success: true });
});

router.patch('messages/:id/delivered', requireAuth, async (req, res) => {
  try {
    const userContext = await getUserContext(req.user.email);
    const { profile } = userContext;

    const result = await query(
      `
      update messages
      set delivered = true
      where id = $1
        and sender_id != $2
        and delivered = false
      returning *
      `,
      [req.params.id, profile.id]
    );

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    return sendError(res, 'Failed to mark delivered');
  }
});

router.post('/threads/:id/messages', requireAuth, async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    return sendError(res, 'Message content is required', 400);
  }

  try {
    const userContext = await getUserContext(req.user.email);

    if (userContext.error) {
      return sendError(res, userContext.error, userContext.status);
    }

    const { profile, shelter } = userContext;

    const thread = await getThreadForUser(req.params.id, profile.id, shelter?.id || null);

    if (!thread) {
      return sendError(res, 'Thread not found', 404);
    }

    const result = await query(
      `
      insert into messages (
        thread_id,
        sender_id,
        content,
        delivered,
        read
      )
      values ($1,$2,$3,false,false)
      returning *
      `,
      [req.params.id, profile.id, content.trim()]
    );

    await query(
      `
      update message_threads
      set updated_at = now()
      where id = $1
      `,
      [req.params.id]
    );

    return sendSuccess(res, result.rows[0], 201);
  } catch (error) {
    console.error('Failed to send message:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
    });

    return sendError(res, 'Failed to send message');
  }
});

export default router;