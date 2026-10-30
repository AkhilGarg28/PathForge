const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');

// Load .env from server directory if present
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const envSchema = z
  .object({
    PORT: z
      .string()
      .default('5000')
      .transform((val) => parseInt(val, 10)),
    MONGODB_URI: z
      .string({
        required_error: 'MONGODB_URI is required',
      })
      .min(1, 'MONGODB_URI is required'),
    JWT_SECRET: z
      .string({
        required_error: 'JWT_SECRET is required',
      })
      .min(1, 'JWT_SECRET is required'),
    CLIENT_URL: z
      .string({
        required_error: 'CLIENT_URL is required',
      })
      .min(1, 'CLIENT_URL is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GEMINI_MODEL: z.string().default('gemini-1.5-pro'),
    GEMINI_API_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.NODE_ENV === 'production' &&
      (!data.GEMINI_API_KEY || data.GEMINI_API_KEY.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'GEMINI_API_KEY is required in production',
        path: ['GEMINI_API_KEY'],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  console.error(`\nEnvironment configuration error:\n${formattedErrors}\n`);
  process.exit(1);
}

module.exports = parsed.data;
