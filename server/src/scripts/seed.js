import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { auth, mongoClient } from '../auth/auth.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { AuditLog } from '../models/AuditLog.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';

async function seed() {
  try {
    console.log('\n🌱 Initializing Clean Enterprise Task Management System...');
    await connectDatabase();

    const db = mongoClient.db();

    // Clear existing task and user data for a clean production state
    console.log('🧹 Cleaning collections...');
    await Task.deleteMany({});
    await Activity.deleteMany({});
    await AuditLog.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await db.collection('user').deleteMany({});
    await db.collection('session').deleteMany({});
    await db.collection('account').deleteMany({});
    await db.collection('verification').deleteMany({});

    console.log('👤 Initializing Administrator account with Better Auth...');

    // Create solely the real Admin user
    const adminAuth = await auth.api.signUpEmail({
      body: {
        email: 'taskmanagemtsystem.info@gmail.com',
        password: 'admin@123',
        name: 'System Administrator',
      },
    });

    const adminUser = await User.findByIdAndUpdate(
      adminAuth.user.id,
      { role: 'ADMIN', isActive: true },
      { new: true }
    );
    console.log(`  ✅ Admin created: ${adminUser.name} (${adminUser.email})`);

    console.log('\n==================================================');
    console.log('🎉 Clean Database Initialized Successfully!');
    console.log('✨ No static or dummy employees/tasks loaded.');
    console.log('✨ Add real employees through the Admin Portal.');
    console.log('\n🔐 ADMIN CREDENTIALS:');
    console.log('   Email:    taskmanagemtsystem.info@gmail.com');
    console.log('   Password: admin@123');
    console.log('==================================================\n');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

seed();
