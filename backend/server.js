import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { ping } from './db/client.js';

import authRouter from './routes/authRoutes.js';
import preferencesRouter from './routes/preferenceRoutes.js';
import animalsRouter from './routes/animalsRoutes.js';
import messagingRouter from './routes/messagingRoutes.js';
import sheltersRouter from './routes/sheltersRoutes.js';
import swipeRoutes from './routes/swipeRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '15mb' }));

// Health check
app.get('/', (_req, res) => res.send('Backend is running'));


// DB health check
app.get('/api/health', async (_req, res) => {
  try {
    const db = await ping();
    res.json({
      ok: true,
      message: 'Backend and database are connected',
      db,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      ok: false,
      error: 'Database connection failed',
    });
  }
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/animals', animalsRouter);
app.use('/api/messages', messagingRouter);
app.use('/api/shelters', sheltersRouter);
app.use('/api/swipes', swipeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const db = await ping();
    console.log('Database connected:', db);
  } catch (error) {
    console.error('Database connection failed on startup:', error.message);
  }
});