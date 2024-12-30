import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
const router = express.Router();

// Get all routines for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const routines = await prisma.routine.findMany({
            where: {
                user_id: req.user.id
            },
            orderBy: {
                created_at: 'desc'
            },
            include: { routine_progress: true }
        });

        const transformedRoutines = routines.map(routine => ({
            ...routine,
            progress: routine.routine_progress, // Rename routine_progress to progress
            routine_progress: undefined, // Remove the original field (optional)
        }));

        res.json(transformedRoutines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch routines' });
    }
});

router.get('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const routines = await prisma.routine_progress.findMany({
            where: {
                routine_id: parseInt(req.params.id),
                user_id: req.user.id
            }
        });

        res.json(routines);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch routines' });
    }
});

// Create a new routine
router.post('/', authenticateToken, async (req, res) => {
    const { title, description, type, daily_target } = req.body;

    try {
        const routine = await prisma.routine.create({
            data: {
                title,
                description,
                type,
                daily_target,
                streak: 0,
                user_id: req.user.id
            }
        });

        res.json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create routine' });
    }
});

// Update a routine
router.patch('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // update last completed date
        const routine = await prisma.routine.update({
            where: {
                id: parseInt(id),
                user_id: req.user.id
            },
            data: updates
        });

        // update routine progress
        await prisma.routine_progress.create({
            data: {
                routine_id: parseInt(id),
                user_id: req.user.id
            }
        });

        res.json(routine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update routine' });
    }
});

// Update routine streak
router.patch('/:id/complete', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const routine = await prisma.routine.findUnique({
            where: {
                id: parseInt(id),
                user_id: req.user.id
            }
        });

        if (!routine) {
            return res.status(404).json({ error: 'Routine not found' });
        }

        const today = new Date();
        const lastCompleted = routine.last_completed_at;
        let newStreak = routine.streak;

        // If this is the first completion or it was completed yesterday, increment streak
        if (!lastCompleted || isYesterday(lastCompleted)) {
            newStreak += 1;
        }
        // If it wasn't completed yesterday, reset streak to 1
        else if (!isToday(lastCompleted)) {
            newStreak = 1;
        }

        const updatedRoutine = await prisma.routine.update({
            where: {
                id: parseInt(id)
            },
            data: {
                streak: newStreak,
                last_completed_at: today
            }
        });

        res.json(updatedRoutine);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update routine streak' });
    }
});

// Delete a routine
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.routine.delete({
            where: {
                id: parseInt(id),
                user_id: req.user.id
            }
        });
        res.json({ message: 'Routine deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete routine' });
    }
});

// Helper functions to check dates
function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString() === new Date(date).toDateString();
}

function isToday(date) {
    return new Date().toDateString() === new Date(date).toDateString();
}

export default router;