import express from 'express';
import { getThreads } from '../controllers/threadsController.js';

const router = express.Router();

router.get('/:userId', getThreads);

export default router;