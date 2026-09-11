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

const vercelHost = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
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
    process.env.BETTER_AUTH_URL || vercelHost || 'http://localhost:5000'
  ),
  CLIENT_URL: z.string().default(
    process.env.CLIENT_URL || vercelHost || 'http://localhost:5173'
  ),
  MAIL_HOST: z.string().default('smtp.gmail.com'),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string().default(process.env.MAIL_USER || 'taskmanagemtsystem.info@gmail.com'),
  MAIL_PASSWORD: z.string().default(process.env.MAIL_PASSWORD || 'jsgmholmapdatmxp'),
  MAIL_FROM: z.string().default(process.env.MAIL_FROM || '"Enterprise TMS" <taskmanagemtsystem.info@gmail.com>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => ` - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.warn('\n⚠️ Environment variable warning:\n' + issues + '\nUsing resilient defaults.');
}

export const env = parsed.success ? parsed.data : envSchema.parse({});

