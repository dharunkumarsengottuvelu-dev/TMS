import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly, then root directory .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://enterprise-tms.vercel.app');

if (isVercel) {
  process.env.NODE_ENV = 'production';
  if (!process.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL.includes('localhost')) {
    process.env.BETTER_AUTH_URL = vercelHost;
  }
  if (!process.env.CLIENT_URL || process.env.CLIENT_URL.includes('localhost')) {
    process.env.CLIENT_URL = vercelHost;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default(isVercel ? 'production' : 'development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default(
    process.env.MONGODB_URI ||
    'mongodb+srv://dharunsensi_db_user:lBMpyK27hDWkVsaV@taskmanagement.jomxqrg.mongodb.net/tms_enterprise_db?retryWrites=true&w=majority&appName=TaskManagement'
  ),
  BETTER_AUTH_SECRET: z.string().default(
    process.env.BETTER_AUTH_SECRET ||
    'enterprise_super_secret_session_key_min_32_characters_long_12345'
  ),
  BETTER_AUTH_URL: z.string().default(
    isVercel
      ? vercelHost
      : (process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://enterprise-tms.vercel.app' : 'http://localhost:5000'))
  ),
  CLIENT_URL: z.string().default(
    isVercel
      ? vercelHost
      : (process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://enterprise-tms.vercel.app' : 'http://localhost:5173'))
  ),
  // SMTP & Mail Configuration (supports standard SMTP_* and legacy MAIL_*)
  SMTP_HOST: z.string().default(process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587)),
  SMTP_USER: z.string().default(process.env.SMTP_USER || process.env.MAIL_USER || ''),
  SMTP_PASS: z.string().default(process.env.SMTP_PASS || process.env.MAIL_PASSWORD || ''),
  EMAIL_FROM: z.string().default(process.env.EMAIL_FROM || process.env.MAIL_FROM || '"TaskOps Enterprise" <noreply@taskops.internal>'),

  MAIL_HOST: z.string().default(process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com'),
  MAIL_PORT: z.coerce.number().default(Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587)),
  MAIL_USER: z.string().default(process.env.SMTP_USER || process.env.MAIL_USER || ''),
  MAIL_PASSWORD: z.string().default(process.env.SMTP_PASS || process.env.MAIL_PASSWORD || ''),
  MAIL_FROM: z.string().default(process.env.EMAIL_FROM || process.env.MAIL_FROM || '"TaskOps Enterprise" <noreply@taskops.internal>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => ` - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.warn('\n⚠️ Environment variable warning:\n' + issues + '\nUsing resilient defaults.');
}

export const env = parsed.success ? parsed.data : envSchema.parse({});

