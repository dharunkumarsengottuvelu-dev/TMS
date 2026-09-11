import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';

const mongoClient = new MongoClient(env.MONGODB_URI, {
  serverSelectionTimeoutMS: 8000,
  maxPoolSize: 10,
});
await mongoClient.connect();
const db = mongoClient.db();

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'EMPLOYEE',
        input: false, // Disallow arbitrary client input from setting role
        returned: true,
      },
      isActive: {
        type: 'boolean',
        defaultValue: true,
        input: false,
        returned: true,
      },
      employeeId: {
        type: 'string',
        defaultValue: null,
        input: false,
        returned: true,
      },
      department: {
        type: 'string',
        defaultValue: null,
        input: false,
        returned: true,
      },
      designation: {
        type: 'string',
        defaultValue: null,
        input: false,
        returned: true,
      },
      phone: {
        type: 'string',
        defaultValue: null,
        input: false,
        returned: true,
      },
      onboardingStatus: {
        type: 'string',
        defaultValue: 'ACTIVE',
        input: false,
        returned: true,
      },
    },
  },
  trustedOrigins: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
});

export { mongoClient };
