import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getUserById } from '../services/authService';

const router = Router();

// GET /me - Protected route
router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const user = getUserById(req.user.userId);

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.json({
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
    });
});

export default router;
