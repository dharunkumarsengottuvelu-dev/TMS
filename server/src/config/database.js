import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

// Resolve MongoDB Atlas SRV/TXT records reliably across all Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Graceful fallback if system prohibits custom DNS servers
}

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

    // Self-healing index check for employeeId uniqueness
    try {
      const userCollection = conn.connection.db.collection('user');
      const existingIndexes = await userCollection.indexes();
      const empIndex = existingIndexes.find((idx) => idx.name === 'employeeId_1');
      if (empIndex && !empIndex.partialFilterExpression) {
        console.log('🔄 [Database] Upgrading employeeId_1 index to partialFilterExpression...');
        await userCollection.dropIndex('employeeId_1');
        await userCollection.createIndex(
          { employeeId: 1 },
          { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } }, name: 'employeeId_1' }
        );
        console.log('✅ [Database] employeeId_1 index upgraded successfully.');
      }
    } catch (idxErr) {
      console.warn('⚠️ [Database] Index reconciliation check non-fatal notice:', idxErr.message);
    }

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
