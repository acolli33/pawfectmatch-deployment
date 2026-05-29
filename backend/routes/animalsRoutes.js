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

async function getAnimalById(id) {
  const result = await query(
    `
    select *
    from animals
    where id = $1
      and deleted_at is null
    limit 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await query(
      `
      select *
      from animals
      where deleted_at is null
      order by created_at desc
      `
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to fetch animals');
  }
});

router.get('/mine', requireAuth, requireRole(['shelter']), async (req, res) => {
  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    const shelter = await getShelterByUserId(profile.id);

    if (!shelter) {
      return sendError(res, 'Shelter record not found', 404);
    }

    const result = await query(
      `
      select *
      from animals
      where shelter_id = $1
        and deleted_at is null
      order by created_at desc
      `,
      [shelter.id]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to fetch shelter animals');
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
      select
        a.id,
        a.shelter_id,
        a.name,
        a.type,
        a.breed,
        a.age,
        a.size,
        a.sex,
        a.description,
        a.temperament_tags,
        a.good_with_children,
        a.good_with_other_animals,
        a.must_be_leashed,
        a.special_needs,
        a.availability,
        a.intake_date,
        a.adoption_fee,
        a.primary_photo_url,
        a.created_at,
        a.updated_at,

        s.organization_name,
        s.description as shelter_description,
        s.address as shelter_address,
        s.city as shelter_city,
        s.state as shelter_state,
        s.zip_code as shelter_zip_code,
        s.phone as shelter_phone,
        s.email as shelter_email,
        s.website as shelter_website,
        s.logo_url as shelter_logo_url,
        s.verified as shelter_verified
      from animals a
      left join shelters s
        on s.id = a.shelter_id
      where a.id = $1
        and a.deleted_at is null
      limit 1
      `,
      [req.params.id]
    );

    const animal = result.rows[0];

    if (!animal) {
      return sendError(res, 'Animal not found', 404);
    }

    return sendSuccess(res, animal);
  } catch (error) {
    console.error('Failed to fetch animal:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
    });

    return sendError(res, 'Failed to fetch animal');
  }
});

router.post('/', requireAuth, requireRole(['shelter']), async (req, res) => {
  const {
    name,
    type,
    breed,
    ageYears,
    ageMonths,
    sex,
    size,
    adoption_fee,
    disposition,
    availability,
    description,
    medicalNotes,
    photos,
  } = req.body;

  const errors = {};

  if (!name?.trim()) errors.name = 'Animal name is required';
  if (!type) errors.type = 'Animal type is required';
  if (ageYears === '' && ageMonths === '') {
    errors.age = 'Please provide age in years or months';
  }
  if (!sex) errors.sex = 'Sex is required';
  if (!size) errors.size = 'Size is required';
  if (!description?.trim()) {
    errors.description = 'Description is required';
  } else if (description.length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }

  if (!Array.isArray(photos) || photos.length === 0) {
    errors.photos = 'Please upload at least one photo';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    const shelter = await getShelterByUserId(profile.id);

    if (!shelter) {
      return sendError(res, 'Shelter record not found', 404);
    }

    const age = parseInt(ageYears || 0, 10);

    const result = await query(
      `
      insert into animals (
        shelter_id,
        name,
        type,
        breed,
        age,
        size,
        sex,
        description,
        good_with_children,
        good_with_other_animals,
        must_be_leashed,
        special_needs,
        availability,
        primary_photo_url
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, $15)
      returning *
      `,
      [
        shelter.id,
        name,
        type,
        breed || '',
        age,
        size || null,
        sex,
        description,
        disposition?.goodWithChildren || false,
        disposition?.goodWithOtherAnimals || false,
        disposition?.mustBeLeashed || false,
        medicalNotes || '',
        availability || 'available',
        photos?.[0] || null,
        adoption_fee || null,
      ]
    );

    return sendSuccess(res, result.rows[0], 201);
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to create animal');
  }
});

router.put('/:id', requireAuth, requireRole(['shelter']), async (req, res) => {
  const {
    name,
    type,
    breed,
    ageYears,
    ageMonths,
    sex,
    size,
    adoption_fee,
    disposition,
    availability,
    description,
    medicalNotes,
    photos,
  } = req.body;

  const errors = {};

  if (!name?.trim()) errors.name = 'Animal name is required';
  if (!type) errors.type = 'Animal type is required';
  if (ageYears === '' && ageMonths === '') {
    errors.age = 'Please provide age in years or months';
  }
  if (!sex) errors.sex = 'Sex is required';
  if (!size) errors.size = 'Size is required';
  if (!description?.trim()) {
    errors.description = 'Description is required';
  } else if (description.length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }

  if (!Array.isArray(photos) || photos.length === 0) {
    errors.photos = 'Please upload at least one photo';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    const shelter = await getShelterByUserId(profile.id);

    if (!shelter) {
      return sendError(res, 'Shelter record not found', 404);
    }

    const animal = await getAnimalById(req.params.id);

    if (!animal) {
      return sendError(res, 'Animal not found', 404);
    }

    if (animal.shelter_id !== shelter.id) {
      return sendError(res, 'Forbidden: insufficient role', 403);
    }

    const age =
      Number(ageYears || 0) + Number(ageMonths || 0) / 12;

    const result = await query(
      `
      update animals
      set
        name = $1,
        type = $2,
        breed = $3,
        age = $4,
        size = $5,
        sex = $6,
        description = $7,
        good_with_children = $8,
        good_with_other_animals = $9,
        must_be_leashed = $10,
        special_needs = $11,
        availability = $12,
        primary_photo_url = $13,
        adoption_fee = $14,
        updated_at = now()
      where id = $15
      returning *
      `,
      [
        name,
        type,
        breed || '',
        age,
        size || null,
        sex,
        description,
        disposition?.goodWithChildren || false,
        disposition?.goodWithOtherAnimals || false,
        disposition?.mustBeLeashed || false,
        medicalNotes || '',
        availability || 'available',
        photos?.[0] || null,
        adoption_fee || null,
        req.params.id,
      ]
    );

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to update animal');
  }
});

router.delete('/:id', requireAuth, requireRole(['shelter']), async (req, res) => {
  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    const shelter = await getShelterByUserId(profile.id);

    if (!shelter) {
      return sendError(res, 'Shelter record not found', 404);
    }

    const animal = await getAnimalById(req.params.id);

    if (!animal) {
      return sendError(res, 'Animal not found', 404);
    }

    if (animal.shelter_id !== shelter.id) {
      return sendError(res, 'Forbidden: insufficient role', 403);
    }

    await query(
      `
      delete from animals
      where id = $1
      `,
      [req.params.id]
    );

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error(error);
    return sendError(res, 'Failed to delete animal');
  }
});

export default router;