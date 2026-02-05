import bcrypt from 'bcrypt';
import { db } from '../db';
import { RegisterInput, LoginInput } from '../validators/auth';
import {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
} from './tokenService';

interface User {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
}

const SALT_ROUNDS = 10;

export async function registerUser(input: RegisterInput): Promise<{ success: boolean; error?: string }> {
    const { email, password } = input;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
        return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    stmt.run(email, passwordHash);

    return { success: true };
}

export async function loginUser(
    input: LoginInput
): Promise<{ success: boolean; accessToken?: string; refreshToken?: string; error?: string }> {
    const { email, password } = input;

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (!user) {
        return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    // Save refresh token
    saveRefreshToken(user.id, refreshToken);

    return { success: true, accessToken, refreshToken };
}

export function refreshAccessToken(
    token: string
): { success: boolean; accessToken?: string; error?: string } {
    const refreshTokenRecord = findRefreshToken(token);

    if (!refreshTokenRecord) {
        return { success: false, error: 'Invalid refresh token' };
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(refreshTokenRecord.user_id) as User | undefined;

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // Generate new access token
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });

    return { success: true, accessToken };
}

export function logoutUser(token: string): void {
    revokeRefreshToken(token);
}

export function getUserById(userId: number): Omit<User, 'password_hash'> | null {
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(userId) as Omit<User, 'password_hash'> | undefined;
    return user || null;
}
