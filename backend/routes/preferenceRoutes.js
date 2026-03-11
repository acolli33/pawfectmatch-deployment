import express from 'express';
import { query } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

const ALLOWED_ANIMAL_TYPES = ['dog', 'cat', 'other'];
const ALLOWED_ANIMAL_SIZES = ['small', 'medium', 'large', 'extra-large'];
const ALLOWED_AGE_PREFERENCES = ['any', 'young', 'adult', 'senior'];

function normalizeEnumValue(value, allowedValues) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return allowedValues.includes(normalized) ? normalized : null;
}

function normalizeEnumArray(values, allowedValues) {
  if (!Array.isArray(values)) return [];

  return [...new Set(
    values
      .map((value) => normalizeEnumValue(value, allowedValues))
      .filter(Boolean)
  )];
}

function parseBreedsInput(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

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

router.get('/me', requireAuth, requireRole(['adopter']), async (req, res) => {
  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    if (String(profile.role).toLowerCase() !== 'adopter') {
      return sendError(res, 'Forbidden: profile is not an adopter', 403);
    }

    const result = await query(
      `
      select *
      from adopter_preferences
      where user_id = $1
      limit 1
      `,
      [profile.id]
    );

    return sendSuccess(res, result.rows[0] || null);
  } catch (error) {
    console.error('Failed to fetch preferences:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
    });

    return sendError(res, 'Failed to fetch preferences');
  }
});

router.put('/me', requireAuth, requireRole(['adopter']), async (req, res) => {
  const {
    animalTypes,
    breeds,
    agePreference,
    sizePreference,
    disposition,
    maxDistance,
    additionalNotes,
  } = req.body;

  const errors = {};

  if (!Array.isArray(animalTypes) || animalTypes.length === 0) {
    errors.animalTypes = 'Please select at least one animal type';
  }

  const parsedMaxDistance = Number(maxDistance);

  if (!Number.isFinite(parsedMaxDistance) || parsedMaxDistance < 1 || parsedMaxDistance > 500) {
    errors.maxDistance = 'Distance must be between 1 and 500 miles';
  }

  if (additionalNotes && String(additionalNotes).length > 1000) {
    errors.additionalNotes = 'Notes must be less than 1000 characters';
  }

  const normalizedAnimalTypes = normalizeEnumArray(animalTypes, ALLOWED_ANIMAL_TYPES);
  const normalizedSizePreferences = normalizeEnumArray(sizePreference || [], ALLOWED_ANIMAL_SIZES);
  const normalizedAgePreference = normalizeEnumValue(
    agePreference || 'any',
    ALLOWED_AGE_PREFERENCES
  );

  if (Array.isArray(animalTypes) && normalizedAnimalTypes.length !== animalTypes.length) {
    errors.animalTypes = 'One or more animal types are invalid';
  }

  if (
    Array.isArray(sizePreference) &&
    normalizedSizePreferences.length !== sizePreference.length
  ) {
    errors.sizePreference = 'One or more size preferences are invalid';
  }

  if (!normalizedAgePreference) {
    errors.agePreference = 'Invalid age preference';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  try {
    const profile = await getProfileByEmail(req.user.email);

    if (!profile) {
      return sendError(res, 'Profile not found', 404);
    }

    if (String(profile.role).toLowerCase() !== 'adopter') {
      return sendError(res, 'Forbidden: profile is not an adopter', 403);
    }

    const parsedBreeds = parseBreedsInput(breeds);

    const result = await query(
      `
      insert into adopter_preferences (
        user_id,
        animal_types,
        breeds,
        age_preference,
        size_preferences,
        good_with_children,
        good_with_other_animals,
        max_distance,
        additional_notes
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      on conflict (user_id)
      do update set
        animal_types = excluded.animal_types,
        breeds = excluded.breeds,
        age_preference = excluded.age_preference,
        size_preferences = excluded.size_preferences,
        good_with_children = excluded.good_with_children,
        good_with_other_animals = excluded.good_with_other_animals,
        max_distance = excluded.max_distance,
        additional_notes = excluded.additional_notes,
        updated_at = now()
      returning *
      `,
      [
        profile.id,
        normalizedAnimalTypes,
        parsedBreeds,
        normalizedAgePreference,
        normalizedSizePreferences,
        !!disposition?.goodWithChildren,
        !!disposition?.goodWithOtherAnimals,
        parsedMaxDistance,
        additionalNotes?.trim() || '',
      ]
    );

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    console.error('Failed to save preferences:', {
      message: error.message,
      detail: error.detail,
      code: error.code,
      constraint: error.constraint,
    });

    return sendError(res, 'Failed to save preferences');
  }
});

export default router;