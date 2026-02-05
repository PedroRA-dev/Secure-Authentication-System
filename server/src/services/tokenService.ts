import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { env } from '../config/env';

interface TokenPayload {
    userId: number;
    email: string;
}

interface RefreshToken {
    id: number;
    user_id: number;
    token: string;
    expires_at: string;
    revoked_at: string | null;
    created_at: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwtAccessSecret, {
        expiresIn: `${env.accessTokenTtlMin}m`,
    });
}

export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
    } catch {
        return null;
    }
}

export function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

export function saveRefreshToken(userId: number, token: string): void {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.refreshTokenTtlDays);

    const stmt = db.prepare(`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `);

    stmt.run(userId, token, expiresAt.toISOString());
}

export function findRefreshToken(token: string): RefreshToken | undefined {
    const stmt = db.prepare(`
    SELECT * FROM refresh_tokens 
    WHERE token = ? 
    AND revoked_at IS NULL 
    AND expires_at > datetime('now')
  `);

    return stmt.get(token) as RefreshToken | undefined;
}

export function revokeRefreshToken(token: string): void {
    const stmt = db.prepare(`
    UPDATE refresh_tokens 
    SET revoked_at = datetime('now')
    WHERE token = ?
  `);

    stmt.run(token);
}

export function revokeAllUserTokens(userId: number): void {
    const stmt = db.prepare(`
    UPDATE refresh_tokens 
    SET revoked_at = datetime('now')
    WHERE user_id = ? AND revoked_at IS NULL
  `);

    stmt.run(userId);
}
