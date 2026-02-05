import { Router, Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../services/authService';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter';
import { env } from '../config/env';

const router = Router();

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax' as const,
    path: '/auth/refresh',
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000, // days to ms
});

// POST /auth/register
router.post(
    '/register',
    registerLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input = registerSchema.parse(req.body);
            const result = await registerUser(input);

            if (!result.success) {
                res.status(400).json({ error: result.error });
                return;
            }

            res.status(201).json({ message: 'User created' });
        } catch (error) {
            next(error);
        }
    }
);

// POST /auth/login
router.post(
    '/login',
    loginLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input = loginSchema.parse(req.body);
            const result = await loginUser(input);

            if (!result.success) {
                res.status(401).json({ error: result.error });
                return;
            }

            // Set refresh token as HttpOnly cookie
            res.cookie('refresh_token', result.refreshToken, getRefreshCookieOptions());

            res.json({ accessToken: result.accessToken });
        } catch (error) {
            next(error);
        }
    }
);

// POST /auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
    }

    const result = refreshAccessToken(refreshToken);

    if (!result.success) {
        res.clearCookie('refresh_token', { path: '/auth/refresh' });
        res.status(401).json({ error: result.error });
        return;
    }

    res.json({ accessToken: result.accessToken });
});

// POST /auth/logout
router.post('/logout', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        logoutUser(refreshToken);
    }

    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    res.status(204).send();
});

export default router;
