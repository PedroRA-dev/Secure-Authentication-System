import { z } from 'zod';

const envSchema = z.object({
    PORT: z.string().default('3000'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    JWT_ACCESS_SECRET: z.string().min(10),
    ACCESS_TOKEN_TTL_MIN: z.string().default('15'),
    REFRESH_TOKEN_TTL_DAYS: z.string().default('14'),
    COOKIE_SECURE: z.string().default('false'),
});

function loadEnv() {
    // Load .env file manually for simplicity (no dotenv dependency)
    const fs = require('fs');
    const path = require('path');

    const envPath = path.join(__dirname, '../../.env');

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach((line: string) => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    }
}

loadEnv();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = {
    port: parseInt(parsed.data.PORT, 10),
    clientOrigin: parsed.data.CLIENT_ORIGIN,
    jwtAccessSecret: parsed.data.JWT_ACCESS_SECRET,
    accessTokenTtlMin: parseInt(parsed.data.ACCESS_TOKEN_TTL_MIN, 10),
    refreshTokenTtlDays: parseInt(parsed.data.REFRESH_TOKEN_TTL_DAYS, 10),
    cookieSecure: parsed.data.COOKIE_SECURE === 'true',
};
