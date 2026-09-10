import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 * Connects once and handles connection events and errors gracefully.
 */
export async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: env.NODE_ENV !== 'production', // Build indexes in dev/test
    });

    isConnected = true;
    const sanitizedHost = conn.connection.host || 'MongoDB cluster';
    console.log(`✅ [Database] Connected successfully to MongoDB host: ${sanitizedHost}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ [Database] Runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [Database] Disconnected from MongoDB. Attempting reconnection...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [Database] Reconnected to MongoDB.');
      isConnected = true;
    });

    return conn.connection;
  } catch (error) {
    console.error('\n❌ [Database] CRITICAL: Failed to connect to MongoDB Atlas / Database.');
    console.error(`Message: ${error.message}`);
    console.error('Please verify your MONGODB_URI in server/.env and ensure network access is allowed.\n');
    throw error;
  }
}

export function getDatabaseConnection() {
  if (!isConnected && mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. Call connectDatabase() first.');
  }
  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🛑 [Database] Disconnected gracefully.');
  }
}
