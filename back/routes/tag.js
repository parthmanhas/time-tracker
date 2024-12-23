import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
dotenv.config();
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const { id, tag } = req.body;
    const user_id = req.user.id;
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
        await prisma.$queryRaw`INSERT INTO tags (timerId, tag, user_id) values (${id}, ${tag}, ${user_id})`;
        res.send(200);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error adding tag' });
    }
})

router.delete('/', authenticateToken, async (req, res) => {
    const { tag } = req.body;
    const user_id = req.user.id;
    if (!tag) {
        console.error('tag not present');
        res.status(500).json({ error: 'tag missing' });
        return;
    }
    try {
        await prisma.$queryRaw`DELETE FROM tags WHERE tag = ${tag} AND user_id = ${user_id}`;
        res.send(200);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error deleting tag' });
    }
})

export default router;