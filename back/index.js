// backend/index.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Route to get all users
app.get('/api/timers', async (req, res) => {
  try {
    const timers = await prisma.timer.findMany();
    res.json(timers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Route to create a new user
app.post('/api/timers/:id', async (req, res) => {
  const { id } = req.params;
  const { remainingTime, status, title, comments, duration } = req.body;
  try {
    const timer = await prisma.timer.upsert({
      where: { id: parseInt(id) },
      update: { remainingTime, status, title, comments, duration },
      create: { remainingTime, status, title, comments, duration }
    });
    res.json(timer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create timer' });
  }
});

app.post('/api/timers', async (req, res) => {
  const { timers } = req.body;
  console.log(req.body)
  if (!timers) {
    console.error('No timers present');
  }
  try {
    for (const timer of timers) {
      const { id, remainingTime, status, title, comments, duration } = timer;
      await prisma.timer.upsert({
        where: { id: parseInt(id) },
        update: { remainingTime, status, title, comments, duration },
        create: { remainingTime, status, title, comments, duration }
      });
    }

    res.send(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create timer' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
