// backend/index.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const prisma = new PrismaClient()
// const prisma = new PrismaClient().$extends({
//   model: {
//     timer: {
//       async updateCompletedAt(params, next) {
//         console.log(params)
//         if (params.model === 'Timer' && params.action === 'update') {
//           const { status } = params.args.data;

//           // Set `completedAt` if status is 'completed' and completedAt is not already set
//           if (status === 'COMPLETED' && !params.args.data.completedAt) {
//             params.args.data.completedAt = new Date().toISOString();
//           }
//         }
//         return next(params);
//       }
//     }
//   }
// });

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
  const { remainingTime, status, title, comments, duration, createdAt } = req.body;
  try {
    const timer = await prisma.timer.upsert({
      where: { id },
      update: { remainingTime, status, title, comments },
      create: { id, remainingTime, status, title, comments, duration, createdAt }
    });
    res.json(timer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create timer' });
  }
});

app.post('/api/timers', async (req, res) => {
  const { timers } = req.body;
  if (!timers) {
    console.error('No timers present');
  }
  try {
    for (const timer of timers) {
      const { id, remainingTime, status, title, comments, duration } = timer;
      await prisma.timer.upsert({
        where: { id },
        update: { remainingTime, status, title, comments, duration },
        create: { id, remainingTime, status, title, comments, duration }
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
