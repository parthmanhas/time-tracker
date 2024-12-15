// backend/index.js
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

prisma.$use(async (params, next) => {
  console.log('Query: ', params.model, params.action);
  console.log('Params: ', params.args);
  const result = await next(params);
  return result;
});

app.use(cors());
app.use(express.json());

// Route to get all users
app.get('/api/timers', async (req, res) => {
  try {
    const timers = await prisma.$queryRaw`select t.id, t.status, t.title, t.duration, t."remainingTime", t."completedAt", t."createdAt", t.due_at, coalesce(array_agg(distinct tags.tag), '{}') as tags, coalesce(array_agg(distinct comments.comment), '{}') as comments from public."Timer" t left join tags on t.id = tags.timerId left join comments on t.id = comments.timerId group by t.id`;
    res.json(timers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Route to create a new timer
app.post('/api/timer', async (req, res) => {
  const { id, remainingTime, status, title, duration, tags } = req.body;
  try {
    const timer = await prisma.$queryRaw`INSERT INTO public."Timer" (id, status, title, duration, "remainingTime") values (${id}, ${status}::"TimerStatus", ${title}, ${duration}, ${remainingTime})`;
    if (tags) {
      for (const tag of tags) {
        await prisma.$queryRaw`INSERT INTO tags (timerId, tag) values (${id}, ${tag})`;
      }
    }
    res.status(200).json({ timer })

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create timer' });
  }
});

app.patch('/api/timer', async (req, res) => {
  const { id, remainingTime, status, title, comments, duration, completedAt, due_at } = req.body;

  if (!id) {
    console.error('id not present');
    res.status(500).json({ error: 'id missing' });
    return;
  }

  if (!remainingTime && !status && !title && !comments && !duration && !completedAt && !due_at) {
    console.error('nothing to update');
    res.status(500).json({ error: 'info missing to update' });
    return;
  }

  try {
    const timer = await prisma.timer.update({
      data: {
        status,
        title,
        duration,
        remainingTime,
        completedAt,
        due_at
      },
      where: {
        id
      }
    })
    res.status(200).json(timer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'error updating timer' });
  }

})

// app.post('/api/timers', async (req, res) => {
//   const { timers } = req.body;
//   if (!timers) {
//     console.error('No timers present');
//   }
//   try {
//     for (const timer of timers) {
//       const { id, remainingTime, status, title, comments, duration } = timer;
//       await prisma.timer.upsert({
//         where: { id },
//         update: { remainingTime, status, title, comments, duration },
//         create: { id, remainingTime, status, title, comments, duration }
//       });
//     }

//     res.send(200);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Could not create timer' });
//   }
// });

app.post('/add-tag', async (req, res) => {
  const { id, tag } = req.body;
  if (!id) {
    console.error('id not present');
    res.status(500).json({ error: 'id missing' });
    return;
  }

  if (!tag) {
    console.error('tag not present');
    res.status(500).json({ error: 'tag missing' });
    return;
  }
  try {
    await prisma.$queryRaw`INSERT INTO tags (timerId, tag) values (${id}, ${tag})`;
    res.send(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error adding tag' });
  }
})

app.post('/comment', async (req, res) => {
  const { id, comment } = req.body;
  if (!id) {
    console.error('id not present');
    res.status(500).json({ error: 'id missing' });
    return;
  }

  if (!comment) {
    console.error('comment not present');
    res.status(500).json({ error: 'comment missing' });
    return;
  }

  try {
    await prisma.$queryRaw`INSERT INTO comments (timerId, comment) values (${id}, ${comment})`;
    res.send(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error adding tag' });
  }
})

app.delete('/api/tag', async (req, res) => {
  const { tag } = req.body;
  if (!tag) {
    console.error('tag not present');
    res.status(500).json({ error: 'tag missing' });
    return;
  }
  try {
    await prisma.$queryRaw`DELETE FROM tags WHERE tag = ${tag}`;
    res.send(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting tag' });
  }
})

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
