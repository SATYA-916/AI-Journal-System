import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  analysisCacheTtlSeconds: Number(process.env.ANALYSIS_CACHE_TTL_SECONDS || 60 * 60 * 24 * 7),
  dedupeLockTtlSeconds: Number(process.env.DEDUPE_LOCK_TTL_SECONDS || 30),
};
