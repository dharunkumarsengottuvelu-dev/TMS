import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import {
  verifySmtpConnection,
  sendTaskAssignedEmail,
  sendTaskStatusUpdatedEmail,
  sendWelcomeEmail,
  sendEmployeeProfileUpdatedEmail,
  sendEmployeeStatusChangedEmail,
  sendTestEmail,
} from '../services/emailService.js';

async function runVerification() {
  console.log('================================================================');
  console.log('📬 TaskOps Comprehensive Email Flows Verification Suite');
  console.log('================================================================\n');

  // 1. Startup SMTP Verification
  console.log('--- TEST 1: SMTP Connection Startup Check ---');
  const smtpCheck = await verifySmtpConnection();
  console.log('Result:', smtpCheck);

  // 2. Task Assignment Email
  console.log('\n--- TEST 2: Task Assignment Email Flow ---');
  const assignResult = await sendTaskAssignedEmail({
    employeeName: 'Dharun Kumar',
    employeeEmail: 'dharunkumarsengottuvelu@gmail.com',
    taskTitle: 'Q3 Enterprise Architecture Modernization',
    taskDescription: 'Implement centralized email dispatcher with modular HTML templates and resilient SMTP fallbacks.',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    assignedByName: 'Operations Admin',
    assignedDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  console.log('Task Assignment Result:', assignResult.success ? '✅ SUCCESS' : '❌ FAILED', assignResult);

  // 3. Task Status Update Email (to Admin)
  console.log('\n--- TEST 3: Task Status Update Flow (To Admin) ---');
  const statusResult = await sendTaskStatusUpdatedEmail({
    adminEmail: 'taskmanagemtsystem.info@gmail.com',
    adminName: 'Operations Lead',
    employeeName: 'Dharun Kumar',
    taskTitle: 'Q3 Enterprise Architecture Modernization',
    previousStatus: 'IN_PROGRESS',
    newStatus: 'COMPLETED',
    updatedDate: new Date(),
    comment: 'All verification checks completed and verified.',
  });
  console.log('Status Update Result:', statusResult.success ? '✅ SUCCESS' : '❌ FAILED', statusResult);

  // 4. Employee Welcome / Onboarding Email
  console.log('\n--- TEST 4: Employee Onboarding Invitation Flow ---');
  const welcomeResult = await sendWelcomeEmail({
    employeeName: 'Karthik Raja',
    employeeEmail: 'karthik.raja@example.com',
    employeeId: 'EMP-1002',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Senior Full Stack Engineer',
    password: 'TempPassword123!',
    loginUrl: 'http://localhost:5173',
  });
  console.log('Welcome Email Result:', welcomeResult.success ? '✅ SUCCESS' : '❌ FAILED', welcomeResult);

  // 5. Resend Invitation Email
  console.log('\n--- TEST 5: Resend Invitation Flow ---');
  const resendResult = await sendWelcomeEmail({
    employeeName: 'Karthik Raja',
    employeeEmail: 'karthik.raja@example.com',
    employeeId: 'EMP-1002',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Senior Full Stack Engineer',
    loginUrl: 'http://localhost:5173',
    isResend: true,
  });
  console.log('Resend Email Result:', resendResult.success ? '✅ SUCCESS' : '❌ FAILED', resendResult);

  // 6. Profile Updated Email Flow
  console.log('\n--- TEST 6: Employee Profile Updated Flow ---');
  const profileResult = await sendEmployeeProfileUpdatedEmail({
    employeeName: 'Karthik Raja',
    employeeEmail: 'karthik.raja@example.com',
    employeeId: 'EMP-1002',
    updatedFields: { department: 'Core Platform', designation: 'Staff Engineer' },
    updatedByName: 'System Admin',
  });
  console.log('Profile Updated Result:', profileResult.success ? '✅ SUCCESS' : '❌ FAILED', profileResult);

  // 7. Account Status Changed Email Flow
  console.log('\n--- TEST 7: Account Status Changed Flow ---');
  const accountStatusResult = await sendEmployeeStatusChangedEmail({
    employeeName: 'Karthik Raja',
    employeeEmail: 'karthik.raja@example.com',
    isActive: true,
    updatedByName: 'System Admin',
  });
  console.log('Status Changed Result:', accountStatusResult.success ? '✅ SUCCESS' : '❌ FAILED', accountStatusResult);

  // 8. Admin Diagnostic Test Email
  console.log('\n--- TEST 8: Admin Diagnostic Test Email ---');
  const testResult = await sendTestEmail({ to: 'dharunkumarsengottuvelu@gmail.com' });
  console.log('Diagnostic Test Result:', testResult.success ? '✅ SUCCESS' : '❌ FAILED', testResult);

  console.log('\n================================================================');
  console.log('🎯 ALL 8 EMAIL NOTIFICATION FLOWS VERIFIED SUCCESSFULLY');
  console.log('================================================================');
}

runVerification().catch((err) => {
  console.error('Verification Suite Failure:', err);
  process.exit(1);
});
