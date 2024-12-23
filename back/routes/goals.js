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
    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        target_hours: targetHours,
        priority,
        user_id: req.user.id,
        tags: {
          create: tags.map(tag => ({
            tag,
            user_id: req.user.id,
            timerid: null // or handle this according to your schema requirements
          }))
        }
      },
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
      tags: goal.tags.map(t => t.tag)
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