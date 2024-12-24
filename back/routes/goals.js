import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
const router = express.Router();

// Get all goals for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const goals = await prisma.goal.findMany({
            where: {
                user_id: req.user.id
            },
            include: {
                tags: {
                    select: {
                        tag: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Transform the response to match the frontend type
        const transformedGoals = goals.map(goal => ({
            ...goal,
            tags: Array.from(new Set(goal.tags.map(t => t.tag)))
        }));

        res.json(transformedGoals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch goals' });
    }
});

// Create a new goal
router.post('/', authenticateToken, async (req, res) => {
    const { title, description, targetHours, priority, tags } = req.body;

    try {
        if (priority === 'HIGH') {
            const [goal] = await prisma.$queryRaw`SELECT * FROM GOAL WHERE priority = 'HIGH' AND user_id = ${req.user.id} AND completed_at is null`;
            if (goal) {
                return res.status(400).json({ error: 'You already have a high priority goal' });
            }
        }
        const [goal] = await prisma.$queryRaw`INSERT INTO GOAL (title, description, target_hours, priority, user_id, is_active) values (${title}, ${description}, ${targetHours}, ${priority}::"GoalPriority", ${req.user.id}, true) RETURNING id, title, description, target_hours, priority, is_active, created_at`;
        for (let tag of tags) {
            await prisma.$queryRaw`UPDATE TAGS SET goal_id = ${goal.id} where user_id = ${req.user.id} and tag = ${tag}`;
        }
        // Transform the response
        const transformedGoal = {
            ...goal,
            tags: Array.from(new Set(tags))
        };

        res.json(transformedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create goal' });
    }
});

// Update a goal
router.patch('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const goal = await prisma.goal.update({
            where: {
                id: parseInt(id),
                user_id: req.user.id
            },
            data: updates,
            include: {
                tags: {
                    select: {
                        tag: true
                    }
                }
            }
        });

        // Transform the response
        const transformedGoal = {
            ...goal,
            tags: Array.from(new Set(goal.tags.map(t => t.tag)))
        };

        res.json(transformedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update goal' });
    }
});

// Delete (archive) a goal
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.goal.update({
            where: {
                id,
                user_id: req.user.id
            },
            data: {
                isActive: false
            }
        });
        res.json({ message: 'Goal archived' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not archive goal' });
    }
});

export default router; 