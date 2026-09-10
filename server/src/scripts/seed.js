import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { auth, mongoClient } from '../auth/auth.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

async function seed() {
  try {
    console.log('\n🌱 Starting Enterprise Task Management System Seeder...');
    await connectDatabase();

    const db = mongoClient.db();

    // Clear existing task and user data for a clean, deterministic state
    console.log('🧹 Cleaning existing collections...');
    await Task.deleteMany({});
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

    // 3. Create Enterprise Tasks
    console.log('\n📋 Creating production-grade enterprise tasks...');
    const tasks = [
      {
        title: 'Microservices Gateway Performance Optimization',
        description: 'Profile incoming REST gateway endpoints, optimize payload compression, and implement Redis-based distributed rate limiting to reduce latency below 45ms at p99.',
        assignedEmployee: createdEmployees[0]._id, // Alex Chen
        assignedBy: adminUser._id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      },
      {
        title: 'Zero-Downtime MongoDB Atlas Cluster Migration',
        description: 'Execute production MongoDB Atlas shard upgrade and secondary replica verification with zero downtime during the maintenance window.',
        assignedEmployee: createdEmployees[1]._id, // Maya Patel
        assignedBy: adminUser._id,
        priority: 'HIGH',
        status: 'COMPLETED',
      },
      {
        title: 'Enterprise RBAC Audit & Penetration Hardening',
        description: 'Review role hierarchy, verify backend authorization middleware, ensure strict resource ownership constraints, and sanitize response headers.',
        assignedEmployee: createdEmployees[0]._id, // Alex Chen
        assignedBy: adminUser._id,
        priority: 'HIGH',
        status: 'COMPLETED',
      },
      {
        title: 'Real-Time Notification Dispatcher with Nodemailer',
        description: 'Implement enterprise HTML notification templates, resilient SMTP failure handling, and non-blocking background queue integration.',
        assignedEmployee: createdEmployees[2]._id, // Jordan Taylor
        assignedBy: adminUser._id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
      },
      {
        title: 'Design System Accessibility & WCAG 2.1 AA Compliance',
        description: 'Verify all interactive controls, form inputs, modal dialogs, and color contrast tokens adhere to international WCAG 2.1 AA standards.',
        assignedEmployee: createdEmployees[2]._id, // Jordan Taylor
        assignedBy: adminUser._id,
        priority: 'LOW',
        status: 'NOT_STARTED',
      },
      {
        title: 'Cloud Infrastructure Disaster Recovery Automation',
        description: 'Script automated multi-region failover tests, configure health check probe alerts, and document recovery time objectives (RTO).',
        assignedEmployee: createdEmployees[1]._id, // Maya Patel
        assignedBy: adminUser._id,
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
      },
    ];

    await Task.insertMany(tasks);
    console.log(`  ✅ Seeded ${tasks.length} enterprise tasks.`);

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
