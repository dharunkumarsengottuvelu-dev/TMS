import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required for application database connectivity'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters for secure sessions'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL (e.g. http://localhost:5000)'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL (e.g. http://localhost:5173)'),
  MAIL_HOST: z.string().default('smtp.ethereal.email'),
  MAIL_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  MAIL_USER: z.string().default(''),
  MAIL_PASSWORD: z.string().default(''),
  MAIL_FROM: z.string().default('"Enterprise TMS" <no-reply@enterprise.corp>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => ` - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error('\n❌ CRITICAL CONFIGURATION ERROR: Invalid environment variables:\n' + issues + '\n');
  console.error('Please verify your server/.env file contains all required configurations before starting the server.\n');
  process.exit(1);
}

export const env = parsed.data;
