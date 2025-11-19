import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PORT, MONGO_URI } from './config.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import shopRoutes from './routes/shop.js';
import roomRoutes from './routes/room.js';
import stravaRoutes from './routes/strava.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration - allow both local dev and GitHub Pages
const allowedOrigins = [
  'http://localhost:5173',
  'https://adudhe01.github.io',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/strava', stravaRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Mongo error', err);
  });
