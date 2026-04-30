import express from 'express';
import { getMessages, sendMessage, markAsRead } from '../controllers/messagesController.js';

const router = express.Router();

router.get('/:threadId', getMessages);
router.post('/', sendMessage);
router.put('/:threadId/read', markAsRead);

export default router;