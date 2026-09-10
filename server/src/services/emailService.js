import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // If user and password provided, configure SMTP transporter
  if (env.MAIL_USER && env.MAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
      },
    });
  } else {
    // Development fallback transporter (logs preview)
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n📧 [Nodemailer Dev Mock] Email intercepted (No SMTP credentials supplied):');
        console.log(`   To:      ${mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        console.log(`   Snippet: ${mailOptions.text ? mailOptions.text.slice(0, 160) : 'HTML email'}`);
        return { messageId: 'mock-mail-' + Date.now(), accepted: [mailOptions.to] };
      },
    };
  }

  return transporter;
}

/**
 * Send email when an Admin assigns a new task to an employee
 */
export async function sendTaskAssignedEmail({ employeeName, employeeEmail, taskTitle, taskDescription, priority, status, assignedByName, assignedDate }) {
  try {
    const formattedDate = new Date(assignedDate || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const priorityColors = { HIGH: '#dc2626', MEDIUM: '#d97706', LOW: '#2563eb' };
    const badgeColor = priorityColors[priority] || '#4b5563';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc;color:#1e293b}
      .container{max-width:600px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
      .header{background:#0f172a;padding:24px 32px;color:#fff}.header h1{margin:0;font-size:20px;font-weight:600}
      .content{padding:32px}.task-card{background:#f1f5f9;border-left:4px solid #0284c7;padding:20px;border-radius:4px;margin:20px 0}
      .task-title{font-size:18px;font-weight:600;margin:0 0 8px;color:#0f172a}.task-desc{margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569}
      .meta-table{width:100%;border-collapse:collapse;font-size:13px}.meta-table td{padding:8px 0;border-bottom:1px solid #e2e8f0}
      .meta-label{color:#64748b;font-weight:500;width:35%}.meta-value{color:#0f172a;font-weight:600}
      .badge{display:inline-block;padding:3px 8px;border-radius:9999px;font-size:12px;font-weight:700;color:#fff}
      .footer{padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
    </style></head><body><div class="container">
      <div class="header"><h1>Enterprise Task Management System</h1></div>
      <div class="content">
        <p>Hello <strong>${employeeName}</strong>,</p>
        <p>You have been assigned a new task by <strong>${assignedByName}</strong>.</p>
        <div class="task-card">
          <div class="task-title">${taskTitle}</div>
          <div class="task-desc">${taskDescription}</div>
          <table class="meta-table">
            <tr><td class="meta-label">Priority:</td><td class="meta-value"><span class="badge" style="background:${badgeColor}">${priority}</span></td></tr>
            <tr><td class="meta-label">Status:</td><td class="meta-value">${status.replace('_', ' ')}</td></tr>
            <tr><td class="meta-label">Assigned Date:</td><td class="meta-value">${formattedDate}</td></tr>
            <tr><td class="meta-label">Assigned By:</td><td class="meta-value">${assignedByName}</td></tr>
          </table>
        </div>
        <p style="font-size:13px;color:#64748b">Please log in to your employee portal to review full specifications.</p>
      </div>
      <div class="footer">Automated notification from Enterprise Task Management System.</div>
    </div></body></html>`;

    const transport = getTransporter();
    await transport.sendMail({
      from: env.MAIL_FROM,
      to: employeeEmail,
      subject: `[Task Assigned] ${taskTitle} (${priority} Priority)`,
      text: `Hello ${employeeName},\n\nYou have been assigned a new task: ${taskTitle}\nPriority: ${priority}\nAssigned by: ${assignedByName}\n\nPlease check your portal to view details.`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ [EmailService] Failed to send task assignment email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send email when an employee updates task status (to Admin)
 */
export async function sendTaskStatusUpdatedEmail({ adminEmail, adminName, employeeName, taskTitle, previousStatus, newStatus, updatedDate }) {
  try {
    const formattedDate = new Date(updatedDate || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const statusColors = { NOT_STARTED: '#64748b', PENDING: '#d97706', IN_PROGRESS: '#0284c7', COMPLETED: '#16a34a' };
    const newColor = statusColors[newStatus] || '#0f172a';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc;color:#1e293b}
      .container{max-width:600px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
      .header{background:#0f172a;padding:24px 32px;color:#fff}.header h1{margin:0;font-size:20px;font-weight:600}
      .content{padding:32px}.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:20px;margin:20px 0}
      .meta-table{width:100%;border-collapse:collapse;font-size:14px}.meta-table td{padding:10px 0;border-bottom:1px solid #e2e8f0}
      .meta-label{color:#64748b;font-weight:500;width:35%}.meta-value{color:#0f172a;font-weight:600}
      .badge{display:inline-block;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:700;color:#fff}
      .footer{padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
    </style></head><body><div class="container">
      <div class="header"><h1>Task Status Update Notification</h1></div>
      <div class="content">
        <p>Hello <strong>${adminName || 'Admin'}</strong>,</p>
        <p>Employee <strong>${employeeName}</strong> has updated the status of an assigned task.</p>
        <div class="card"><table class="meta-table">
          <tr><td class="meta-label">Task:</td><td class="meta-value">${taskTitle}</td></tr>
          <tr><td class="meta-label">Updated By:</td><td class="meta-value">${employeeName}</td></tr>
          <tr><td class="meta-label">Previous:</td><td class="meta-value" style="color:#64748b">${previousStatus.replace('_', ' ')}</td></tr>
          <tr><td class="meta-label">New Status:</td><td class="meta-value"><span class="badge" style="background:${newColor}">${newStatus.replace('_', ' ')}</span></td></tr>
          <tr><td class="meta-label">Timestamp:</td><td class="meta-value">${formattedDate}</td></tr>
        </table></div>
        <p style="font-size:13px;color:#64748b">Visit the Admin Dashboard to review progress reports.</p>
      </div>
      <div class="footer">Automated notification from Enterprise Task Management System.</div>
    </div></body></html>`;

    const transport = getTransporter();
    await transport.sendMail({
      from: env.MAIL_FROM,
      to: adminEmail,
      subject: `[Status Update] ${taskTitle} ➔ ${newStatus.replace('_', ' ')}`,
      text: `Hello ${adminName || 'Admin'},\n\nEmployee ${employeeName} has updated the task "${taskTitle}" status from ${previousStatus} to ${newStatus}.\n\nTimestamp: ${formattedDate}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ [EmailService] Failed to send status update email:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send professional welcome/onboarding email to a newly created employee.
 * Does NOT include passwords — only account info and login URL.
 */
export async function sendWelcomeEmail({ employeeName, employeeEmail, employeeId, role, department, designation, loginUrl }) {
  try {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc;color:#1e293b}
      .container{max-width:600px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
      .header{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px;color:#fff;text-align:center}
      .header h1{margin:0 0 8px;font-size:22px;font-weight:700}.header p{margin:0;font-size:14px;color:#94a3b8}
      .content{padding:36px 32px}
      .welcome-title{font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px}
      .greeting{font-size:15px;color:#475569;margin-bottom:24px;line-height:1.6}
      .id-badge{display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;padding:8px 18px;border-radius:6px;font-size:18px;font-weight:700;letter-spacing:.04em}
      .id-wrap{text-align:center;margin:0 0 24px}
      .id-label{font-size:13px;color:#64748b;display:block;margin-bottom:6px}
      .info-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0 24px;margin:20px 0}
      .info-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
      .info-row:last-child{border-bottom:none}
      .info-label{color:#64748b;font-weight:500}.info-value{color:#0f172a;font-weight:600}
      .cta-btn{display:block;text-align:center;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:28px auto 0;width:fit-content}
      .note{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;font-size:13px;color:#92400e;margin-top:24px}
      .footer{padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center}
    </style></head><body><div class="container">
      <div class="header">
        <h1>🚀 Welcome to Enterprise TMS</h1>
        <p>Your employee account has been created</p>
      </div>
      <div class="content">
        <h2 class="welcome-title">Hello, ${employeeName}!</h2>
        <p class="greeting">Your employee account on the <strong>Enterprise Task Management System</strong> has been successfully created. You can now log in and access your personalized workspace.</p>
        <div class="id-wrap">
          <span class="id-label">Your Employee ID</span>
          <span class="id-badge">${employeeId || 'EMP-ASSIGNED'}</span>
        </div>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Email</span><span class="info-value">${employeeEmail}</span></div>
          <div class="info-row"><span class="info-label">Role</span><span class="info-value">${role}</span></div>
          ${department ? `<div class="info-row"><span class="info-label">Department</span><span class="info-value">${department}</span></div>` : ''}
          ${designation ? `<div class="info-row"><span class="info-label">Designation</span><span class="info-value">${designation}</span></div>` : ''}
          <div class="info-row"><span class="info-label">Portal</span><span class="info-value">${loginUrl}</span></div>
        </div>
        <a href="${loginUrl}" class="cta-btn">Access Your Employee Portal →</a>
        <div class="note"><strong>First Login:</strong> Use the email address above to sign in. Contact your administrator for your initial credentials.</div>
      </div>
      <div class="footer">Automated onboarding notification from Enterprise Task Management System.<br>Do not reply to this email.</div>
    </div></body></html>`;

    const transport = getTransporter();
    await transport.sendMail({
      from: env.MAIL_FROM,
      to: employeeEmail,
      subject: `Welcome to Enterprise TMS — Account Ready [${employeeId || role}]`,
      text: `Welcome to Enterprise TMS, ${employeeName}!\n\nYour employee account has been created.\n\nEmployee ID: ${employeeId || 'N/A'}\nEmail: ${employeeEmail}\nRole: ${role}\n${department ? `Department: ${department}\n` : ''}${designation ? `Designation: ${designation}\n` : ''}\nLogin URL: ${loginUrl}\n\nContact your administrator if you need your initial credentials.\n\nEnterprise Task Management System`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ [EmailService] Failed to send welcome email:', error.message);
    return { success: false, error: error.message };
  }
}
