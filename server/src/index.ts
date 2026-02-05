import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { initializeDatabase } from './db/schema';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: env.clientOrigin,
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/me', userRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
});
