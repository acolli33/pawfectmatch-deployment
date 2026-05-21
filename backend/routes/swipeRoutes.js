import express from 'express';
import { query } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

async function getAdopterByEmail(email) {
  const result = await query(
    `
    select id, email, role
    from profiles
    where lower(email) = lower($1)
    limit 1
    `,
    [email]
  );

  const profile = result.rows[0];

  if (!profile) {
    return null;
  }

  if (String(profile.role).toLowerCase() !== 'adopter') {
    return null;
  }

  return profile;
}

async function animalExists(animalId) {
  const result = await query(
    `
    select id
    from animals
    where id = $1
      and deleted_at is null
    limit 1
    `,
    [animalId]
  );

  return result.rows.length > 0;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const adopter = await getAdopterByEmail(req.user.email);

    if (!adopter) {
      return sendError(res, 'Only adopters can access animal actions', 403);
    }

    const { animal_id, action } = req.body;

    if (!animal_id) {
      return sendError(res, 'animal_id is required', 400);
    }

    if (!['like', 'skip', 'block'].includes(action)) {
      return sendError(res, 'Action must be like, skip, or block', 400);
    }

    const foundAnimal = await animalExists(animal_id);

    if (!foundAnimal) {
      return sendError(res, 'Animal not found', 404);
    }

    await query(
      `
      delete from swipes
      where user_id = $1
        and animal_id = $2
      `,
      [adopter.id, animal_id]
    );

    if (action === 'skip') {
      return sendSuccess(res, {
        skipped: true,
        animal_id,
      });
    }

    const result = await query(
      `
      insert into swipes (
        user_id,
        animal_id,
        action,
        created_at
      )
      values ($1, $2, $3, now())
      returning *
      `,
      [adopter.id, animal_id, action]
    );

    return sendSuccess(res, result.rows[0], 201);
  } catch (error) {
    console.error('Failed to save animal action:', error);
    return sendError(res, 'Failed to save animal action');
  }
});

router.delete('/:animalId', requireAuth, async (req, res) => {
  try {
    const adopter = await getAdopterByEmail(req.user.email);

    if (!adopter) {
      return sendError(res, 'Only adopters can remove animal actions', 403);
    }

    await query(
      `
      delete from swipes
      where user_id = $1
        and animal_id = $2
      `,
      [adopter.id, req.params.animalId]
    );

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Failed to remove animal action:', error);
    return sendError(res, 'Failed to remove animal action');
  }
});

router.get('/matches', requireAuth, async (req, res) => {
  try {
    const adopter = await getAdopterByEmail(req.user.email);

    if (!adopter) {
      return sendError(res, 'Only adopters can view matches', 403);
    }

    const result = await query(
      `
      select
        s.id as swipe_id,
        s.action,
        s.created_at as matched_at,

        a.id,
        a.shelter_id,
        a.name,
        a.type,
        a.breed,
        a.age,
        a.size,
        a.sex,
        a.description,
        a.good_with_children,
        a.good_with_other_animals,
        a.must_be_leashed,
        a.special_needs,
        a.availability,
        a.primary_photo_url,

        shelter.organization_name
      from swipes s
      join animals a
        on a.id = s.animal_id
      join shelters shelter
        on shelter.id = a.shelter_id
      where s.user_id = $1
        and s.action = 'like'
        and a.deleted_at is null
      order by s.created_at desc
      `,
      [adopter.id]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    console.error('Failed to load matches:', error);
    return sendError(res, 'Failed to fetch matches');
  }
});

export default router;