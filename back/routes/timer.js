import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
dotenv.config();
const router = express.Router();

// Route to create a new timer
router.post('/', async (req, res) => {
    const { userId, id, remainingTime: remaining_time, status, title, duration, tags } = req.body;
    try {
        const timer = await prisma.$queryRaw`INSERT INTO timer (id, status, title, duration, remaining_time) values (${id}, ${status}::"TimerStatus", ${title}, ${duration}, ${remaining_time})`;
        if (tags) {
            for (const tag of tags) {
                await prisma.$queryRaw`INSERT INTO tags (timerId, tag, userId) values (${id}, ${tag}, ${userId})`;
            }
        }
        res.status(200).json({ timer })

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Could not create timer' });
    }
});

router.patch('/', async (req, res) => {
    const { userId, id, remainingTime: remaining_time, status, title, comments, duration, completedAt: completed_at, due_at } = req.body;

    if (!id) {
        console.error('id not present');
        res.status(500).json({ error: 'id missing' });
        return;
    }

    if (!remaining_time && !status && !title && !comments && !duration && !completed_at && !due_at) {
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
                remaining_time,
                completed_at,
                due_at
            },
            where: {
                id,
                userId
            }
        })
        res.status(200).json(timer);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'error updating timer' });
    }

})

export default router;