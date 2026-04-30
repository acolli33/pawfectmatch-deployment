import { pool } from '../db/client.js';

export const getMessages = async (req, res) => {
  const { threadId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE thread_id = $1 ORDER BY created_at ASC',
      [threadId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching messages');
  }
};

export const sendMessage = async (req, res) => {
  const { thread_id, sender_id, content } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO messages (thread_id, sender_id, content, delivered) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [thread_id, sender_id, content]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending message');
  }
};

export const markAsRead = async (req, res) => {
    const { threadId } = req.params;
    const { userId } = req.body;

    try {
        await pool.query(
            `
            UPDATE messages
            SET read = true
            WHERE thread_id = $1
            AND sender_id != $2
            `,
            [threadId, userId]
        );

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating read status");
    }
};