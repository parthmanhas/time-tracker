// backend/index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import timersRouter from './routes/timers.js';
import timerRouter from './routes/timer.js';
import tagRouter from './routes/tag.js';
import commentRouter from './routes/comment.js';
import authRouter from './routes/auth.js';
import journalRouter from './routes/journal.js';
import goalsRouter from './routes/goals.js';
import routineRouter from './routes/routine.js';
dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/timers', timersRouter);
app.use('/api/timer', timerRouter);
app.use('/api/tag', tagRouter);
app.use('/api/comment', commentRouter);
app.use('/api/journal', journalRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/routines', routineRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
