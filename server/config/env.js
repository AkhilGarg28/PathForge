import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve server's .env regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const REQUIRED_ENVS = ['MONGODB_URI', 'JWT_SECRET'];

const WEAK_SECRETS = new Set([
  'secret',
  'password',
  'changeme',
  'jwt_secret',
  'your_jwt_secret_key_here',
  '12345678901234567890123456789012'
]);

/**
 * Validates the cryptographic entropy and length of a JWT secret.
 * Requires minimum 32 characters and rejects common placeholders.
 */
export function isJwtSecretStrong(secret) {
  if (!secret || typeof secret !== 'string') {
    return false;
  }
  if (secret.length < 32) {
    return false;
  }
  if (WEAK_SECRETS.has(secret.toLowerCase())) {
    return false;
  }
  return true;
}

export function validateEnv() {
  // In automated test environments, ensure a strong mock secret exists if not set
  if (process.env.NODE_ENV === 'test') {
    if (!process.env.JWT_SECRET || !isJwtSecretStrong(process.env.JWT_SECRET)) {
      process.env.JWT_SECRET = 'test_jwt_secret_key_with_at_least_32_characters_for_tests!';
    }
    return;
  }

  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[FATAL] Missing required environment variable(s): ${missing.join(', ')}`);
    console.error('Please configure them in your server .env file.');
    process.exit(1);
  }

  if (!isJwtSecretStrong(process.env.JWT_SECRET)) {
    console.error(
      `[FATAL] JWT_SECRET is cryptographically too weak (length: ${process.env.JWT_SECRET.length}).`
    );
    console.error(
      'JWT_SECRET must be at least 32 characters long and cannot be a common placeholder.'
    );
    process.exit(1);
  }
}

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  llmTimeoutMs: Number(process.env.LLM_TIMEOUT_MS) || 15000
};
