import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function startServer() {
  try {
    console.log('🚀 Starting Enterprise Task Management System Server...');

    // Connect to MongoDB Atlas / Database
    await connectDatabase();

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
    process.exit(1);
  }
}

startServer();
