import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
dotenv.config();
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        const timers = await prisma.$queryRaw`select t.id, t.status, t.title, t.duration, remaining_time, completed_at, created_at, t.due_at, coalesce(array_agg(distinct tags.tag), '{}') as tags, coalesce(array_agg(distinct comments.comment), '{}') as comments from timer t left join tags on t.id = tags.timerId left join comments on t.id = comments.timerId where t.user_id = ${user_id} group by t.id`;
        res.json(timers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;