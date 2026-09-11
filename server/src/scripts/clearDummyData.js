import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';

async function clearDummyData() {
  const client = new MongoClient(env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    console.log('🧹 Clearing all static and dummy data from database...');

    // Delete all tasks, subtasks, activities, comments, audit logs, notifications
    await db.collection('task').deleteMany({});
    await db.collection('tasks').deleteMany({});
    await db.collection('activity').deleteMany({});
    await db.collection('activities').deleteMany({});
    await db.collection('comment').deleteMany({});
    await db.collection('comments').deleteMany({});
    await db.collection('auditlog').deleteMany({});
    await db.collection('auditlogs').deleteMany({});
    await db.collection('notification').deleteMany({});
    await db.collection('notifications').deleteMany({});

    // Find the real admin user
    const admin = await db.collection('user').findOne({ email: 'taskmanagemtsystem.info@gmail.com' });

    if (admin) {
      // Remove all users except the Admin
      const deletedUsers = await db.collection('user').deleteMany({ _id: { $ne: admin._id } });
      await db.collection('account').deleteMany({ userId: { $ne: admin._id.toString() } });
      await db.collection('session').deleteMany({});
      console.log(`✅ Kept Admin: ${admin.email}`);
      console.log(`✅ Deleted ${deletedUsers.deletedCount} dummy employee record(s).`);
    } else {
      console.log('⚠️ Admin user not found. Run seed script to recreate admin.');
    }

    console.log('✨ All dummy tasks, logs, and dummy employees have been completely wiped!');
    console.log('✨ Database is now 100% clean and ready for real data.');
  } catch (error) {
    console.error('❌ Failed to clear dummy data:', error);
  } finally {
    await client.close();
  }
}

clearDummyData();
