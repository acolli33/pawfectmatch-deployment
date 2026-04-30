import { pool } from '../db/client.js';

export const getThreads = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
        WITH my_shelter AS (
          SELECT id FROM shelters WHERE user_id = $1
        )
        SELECT 
          t.id AS thread_id,
          t.animal_id,
          a.name AS animal_name,
          a.primary_photo_url,
          ap.full_name AS adopter_name,
          sh.organization_name AS shelter_name,

          -- 最新メッセージ時刻
          MAX(m.created_at) AS last_message_time,

          -- 未読数
          COUNT(
            CASE
              WHEN m.read = false AND m.sender_id != $1 THEN 1
            END  
          ) AS unread_count,

          -- 相手の名前
          CASE
            WHEN t.adopter_id = $1 THEN sh.organization_name
            WHEN t.shelter_id IN (
              SELECT id FROM my_shelter
              ) 
            THEN ap.full_name
          END AS other_user_name,

          -- 自分の役割
          CASE
            WHEN t.adopter_id = $1 THEN 'adopter'
            WHEN t.shelter_id IN (
              SELECT id FROM my_shelter
            ) THEN 'shelter'
          END AS my_role

        FROM message_threads t

        LEFT JOIN animals a ON t.animal_id = a.id
        LEFT JOIN profiles ap ON t.adopter_id = ap.id
        LEFT JOIN shelters sh ON t.shelter_id = sh.id
        LEFT JOIN messages m ON t.id = m.thread_id

        WHERE t.adopter_id = $1 OR t.shelter_id IN (
          SELECT id FROM my_shelter
        )

        GROUP BY
          t.id,
          t.animal_id,
          a.name,
          a.primary_photo_url,
          ap.full_name,
          sh.organization_name,
          t.adopter_id,
          t.shelter_id

        ORDER BY last_message_time DESC NULLS LAST;
      `, [userId]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching threads');
  }
};
