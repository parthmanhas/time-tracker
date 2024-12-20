// backend/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import timerRoutes from './routes/timer.js';
import timersRoutes from './routes/timers.js';
import tagRoutes from './routes/tag.js';
import commentRoutes from './routes/comment.js';
dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true, }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/timers', timersRoutes);
app.use('/api/tag', tagRoutes);
app.use('/api/comment', commentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
