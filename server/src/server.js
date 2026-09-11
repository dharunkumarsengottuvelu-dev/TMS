import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { Task } from './models/Task.js';
import { User } from './models/User.js';
import { Activity } from './models/Activity.js';
import { AuditLog } from './models/AuditLog.js';
import { Comment } from './models/Comment.js';
import { Notification } from './models/Notification.js';

async function startServer() {
  try {
    console.log('🚀 Starting Enterprise Task Management System Server...');

    // Connect to MongoDB Atlas / Database
    await connectDatabase();

    // Verify and synchronize schema indexes safely
    const syncModelIndex = async (model, modelName) => {
      try {
        await model.init();
      } catch (err) {
        console.warn(`⚠️ [Database] Schema index sync warning for ${modelName}:`, err.message);
      }
    };

    await Promise.allSettled([
      syncModelIndex(User, 'User'),
      syncModelIndex(Task, 'Task'),
      syncModelIndex(Activity, 'Activity'),
      syncModelIndex(AuditLog, 'AuditLog'),
      syncModelIndex(Comment, 'Comment'),
      syncModelIndex(Notification, 'Notification'),
    ]);
    console.log('✅ [Database] All schema indexes verified and synchronized with MongoDB.');

    const server = app.listen(env.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`  🏢 Enterprise TMS Server Running`);
      console.log(`  🌐 Port:       ${env.PORT}`);
      console.log(`  ⚙️  Environment: ${env.NODE_ENV}`);
      console.log(`  🔒 Auth Base:  ${env.BETTER_AUTH_URL}/api/auth`);
      console.log(`  💻 Client URL: ${env.CLIENT_URL}`);
      console.log(`==================================================\n`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('🏁 Server closed cleanly.');
        process.exit(0);
      });

      // Force exit if shutdown hangs
      setTimeout(() => {
        console.error('⚠️ Forcing server shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Critical startup failure:', error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// Serverless handler for Vercel deployment
export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error('❌ Serverless Database Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed in serverless function',
      error: error.message,
    });
  }
}

// Only start standalone listener when not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}
