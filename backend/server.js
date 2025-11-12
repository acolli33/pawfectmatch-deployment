import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import animalsRouter from './routes/animalsRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => res.send('Backend is running'));
//console.log('Registering /api/animals route');

// API routes
//app.use('/api/animals', animalsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
