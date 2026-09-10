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
    console.log('\n🌱 Starting Enterprise Task Management System Seeder...');
    await connectDatabase();

    const db = mongoClient.db();

    // Clear existing task and user data for a clean, deterministic state
    console.log('🧹 Cleaning existing collections...');
    await Task.deleteMany({});
    await Activity.deleteMany({});
    await AuditLog.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await db.collection('user').deleteMany({});
    await db.collection('session').deleteMany({});
    await db.collection('account').deleteMany({});
    await db.collection('verification').deleteMany({});

    console.log('👤 Creating enterprise users with Better Auth...');

    // 1. Create Admin
    const adminAuth = await auth.api.signUpEmail({
      body: {
        email: 'admin@enterprise.corp',
        password: 'AdminPassword123!',
        name: 'Sarah Jenkins',
      },
    });

    const adminUser = await User.findByIdAndUpdate(
      adminAuth.user.id,
      { role: 'ADMIN', isActive: true },
      { new: true }
    );
    console.log(`  ✅ Admin created: ${adminUser.name} (${adminUser.email})`);

    // 2. Create Employees
    const employeeData = [
      {
        email: 'alex.chen@enterprise.corp',
        password: 'EmployeePassword123!',
        name: 'Alex Chen',
      },
      {
        email: 'maya.patel@enterprise.corp',
        password: 'EmployeePassword123!',
        name: 'Maya Patel',
      },
      {
        email: 'jordan.taylor@enterprise.corp',
        password: 'EmployeePassword123!',
        name: 'Jordan Taylor',
      },
    ];

    const createdEmployees = [];
    for (const emp of employeeData) {
      const authRes = await auth.api.signUpEmail({
        body: {
          email: emp.email,
          password: emp.password,
          name: emp.name,
        },
      });

      const updated = await User.findByIdAndUpdate(
        authRes.user.id,
        { role: 'EMPLOYEE', isActive: true },
        { new: true }
      );
      createdEmployees.push(updated);
      console.log(`  ✅ Employee created: ${updated.name} (${updated.email})`);
    }

    // 3. Create Enterprise Tasks with Deadlines and Subtasks
    console.log('\n📋 Creating production-grade enterprise tasks...');
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const tasks = [
      {
        title: 'Microservices Gateway Performance Optimization',
        description: 'Profile incoming REST gateway endpoints, optimize payload compression, and implement Redis-based distributed rate limiting to reduce latency below 45ms at p99.',
        assignedEmployee: createdEmployees[0]._id, // Alex Chen
        assignedBy: adminUser._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        startDate: threeDaysAgo,
        dueDate: fiveDaysLater,
        subtasks: [
          { title: 'Profile endpoint latency under 10k RPS', isCompleted: true, completedAt: threeDaysAgo },
          { title: 'Enable brotli payload compression', isCompleted: true, completedAt: now },
          { title: 'Configure Redis distributed sliding-window counter', isCompleted: false },
        ],
      },
      {
        title: 'Zero-Downtime MongoDB Atlas Cluster Migration',
        description: 'Execute production MongoDB Atlas shard upgrade and secondary replica verification with zero downtime during the maintenance window.',
        assignedEmployee: createdEmployees[1]._id, // Maya Patel
        assignedBy: adminUser._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        completedAt: now,
        startDate: threeDaysAgo,
        dueDate: threeDaysAgo,
        subtasks: [
          { title: 'Provision secondary replica in us-east-1', isCompleted: true, completedAt: threeDaysAgo },
          { title: 'Verify replication lag is zero', isCompleted: true, completedAt: now },
        ],
      },
      {
        title: 'Enterprise RBAC Audit & Penetration Hardening',
        description: 'Review role hierarchy, verify backend authorization middleware, ensure strict resource ownership constraints, and sanitize response headers.',
        assignedEmployee: createdEmployees[0]._id, // Alex Chen
        assignedBy: adminUser._id,
        priority: 'HIGH',
        status: 'COMPLETED',
        completedAt: now,
        startDate: threeDaysAgo,
        dueDate: now,
      },
      {
        title: 'Real-Time Notification Dispatcher with Nodemailer',
        description: 'Implement enterprise HTML notification templates, resilient SMTP failure handling, and non-blocking background queue integration.',
        assignedEmployee: createdEmployees[2]._id, // Jordan Taylor
        assignedBy: adminUser._id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: fiveDaysLater,
      },
      {
        title: 'Design System Accessibility & WCAG 2.1 AA Compliance',
        description: 'Verify all interactive controls, form inputs, modal dialogs, and color contrast tokens adhere to international WCAG 2.1 AA standards.',
        assignedEmployee: createdEmployees[2]._id, // Jordan Taylor
        assignedBy: adminUser._id,
        priority: 'LOW',
        status: 'NOT_STARTED',
        dueDate: threeDaysAgo, // Overdue!
      },
      {
        title: 'Cloud Infrastructure Disaster Recovery Automation',
        description: 'Script automated multi-region failover tests, configure health check probe alerts, and document recovery time objectives (RTO).',
        assignedEmployee: createdEmployees[1]._id, // Maya Patel
        assignedBy: adminUser._id,
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: tenDaysLater,
      },
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`  ✅ Seeded ${createdTasks.length} enterprise tasks.`);

    // 4. Seed Activities and Comments
    console.log('\n📝 Seeding collaboration comments and audit activity...');
    await Comment.create({
      task: createdTasks[0]._id,
      author: adminUser._id,
      content: 'Alex, please ensure benchmark reports are uploaded before Friday.',
    });

    await Comment.create({
      task: createdTasks[0]._id,
      author: createdEmployees[0]._id,
      content: 'Benchmarking script is configured. Initial runs show 32ms p99 latency.',
    });

    await Activity.create([
      {
        task: createdTasks[0]._id,
        actor: adminUser._id,
        action: 'TASK_CREATED',
        newValue: 'Microservices Gateway Performance Optimization',
      },
      {
        task: createdTasks[0]._id,
        actor: createdEmployees[0]._id,
        action: 'STATUS_CHANGED',
        previousValue: 'NOT_STARTED',
        newValue: 'IN_PROGRESS',
      },
      {
        task: createdTasks[1]._id,
        actor: createdEmployees[1]._id,
        action: 'STATUS_CHANGED',
        previousValue: 'IN_PROGRESS',
        newValue: 'COMPLETED',
      },
    ]);

    await AuditLog.create([
      {
        actor: adminUser._id,
        role: 'ADMIN',
        action: 'CREATE_TASK',
        entity: 'TASK',
        entityId: createdTasks[0]._id,
        details: { title: createdTasks[0].title, priority: 'HIGH' },
        ip: '127.0.0.1',
      },
      {
        actor: adminUser._id,
        role: 'ADMIN',
        action: 'PROVISION_SECURITY_ROLE',
        entity: 'SYSTEM',
        details: { policy: 'Strict Server-Side RBAC' },
        ip: '127.0.0.1',
      },
    ]);

    await Notification.create([
      {
        recipient: createdEmployees[0]._id,
        sender: adminUser._id,
        type: 'TASK_ASSIGNED',
        title: 'New High Priority Task',
        message: 'You have been assigned: "Microservices Gateway Performance Optimization".',
        relatedTask: createdTasks[0]._id,
      },
      {
        recipient: adminUser._id,
        sender: createdEmployees[1]._id,
        type: 'STATUS_UPDATED',
        title: 'Task Completed',
        message: 'Maya Patel completed "Zero-Downtime MongoDB Atlas Cluster Migration".',
        relatedTask: createdTasks[1]._id,
      },
    ]);

    console.log('  ✅ Seeded comments, activities, audit logs, and notifications.');

    console.log('\n==================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('   Admin:    admin@enterprise.corp / AdminPassword123!');
    console.log('   Employee: alex.chen@enterprise.corp / EmployeePassword123!');
    console.log('   Employee: maya.patel@enterprise.corp / EmployeePassword123!');
    console.log('   Employee: jordan.taylor@enterprise.corp / EmployeePassword123!');
    console.log('==================================================\n');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
