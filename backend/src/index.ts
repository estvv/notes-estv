import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import foldersRoutes from './routes/folders.js';
import sharedRoutes from './routes/shared.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Trust proxy for rate limiting behind nginx/caddy
app.set('trust proxy', 1);

initDatabase();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// More lenient rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // Increased from 100 to 300
  message: { success: false, error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts' }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/shared', sharedRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});