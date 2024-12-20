import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
dotenv.config();
const router = express.Router();

router.post('/comment', authenticateToken, async (req, res) => {
    const { id, comment } = req.body;
    const user_id = req.user.id;
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
        await prisma.$queryRaw`INSERT INTO comments (timerId, comment, user_id) values (${id}, ${comment}, ${user_id})`;
        res.send(200);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error adding tag' });
    }
})

export default router;