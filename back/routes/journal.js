import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
dotenv.config();
const router = express.Router();

// Get all journal entries for a user
router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    try {
        const entries = await prisma.journal.findMany({
            where: {
                user_id
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch journal entries' });
    }
});

// Create a journal entry
router.post('/', authenticateToken, async (req, res) => {
    const { content } = req.body;
    const user_id = req.user.id;

    try {
        const entry = await prisma.journal.create({
            data: {
                content,
                user_id
            }
        });
        res.json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create journal entry' });
    }
});

// Update a journal entry
router.patch('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    try {
        const entry = await prisma.journal.update({
            where: {
                id: parseInt(id),
                user_id
            },
            data: {
                content
            }
        });
        res.json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update journal entry' });
    }
});

// Delete a journal entry
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        await prisma.journal.delete({
            where: {
                id: parseInt(id),
                user_id
            }
        });
        res.json({ message: 'Journal entry deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete journal entry' });
    }
});

export default router; 