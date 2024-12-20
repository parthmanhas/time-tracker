import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
dotenv.config();
const router = express.Router();

router.post('/tag', async (req, res) => {
    const { userId, id, tag } = req.body;
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
        await prisma.$queryRaw`INSERT INTO tags (timerId, tag, userId) values (${id}, ${tag}, ${userId})`;
        res.send(200);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error adding tag' });
    }
})

router.delete('/tag', async (req, res) => {
    const { userId, tag } = req.body;
    if (!tag) {
        console.error('tag not present');
        res.status(500).json({ error: 'tag missing' });
        return;
    }
    try {
        await prisma.$queryRaw`DELETE FROM tags WHERE tag = ${tag} AND userId = ${userId}`;
        res.send(200);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error deleting tag' });
    }
})

export default router;