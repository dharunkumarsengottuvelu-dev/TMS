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
 * Includes personalized greeting, role, designation, login credentials, and direct portal button.
 */
export async function sendWelcomeEmail({
  employeeName,
  employeeEmail,
  employeeId,
  role,
  department,
  designation,
  password,
  loginUrl,
}) {
  try {
    const portalUrl = loginUrl.endsWith('/login') ? loginUrl : `${loginUrl}/login`;
    const resolvedRole = role || 'EMPLOYEE';
    const resolvedDesignation = designation || 'Team Member';
    const resolvedDepartment = department || 'General';
    const resolvedEmployeeId = employeeId || 'EMP-1001';

    // Fully inlined HTML for 100% email client compatibility (Gmail, Outlook, Apple Mail)
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Enterprise TMS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); background-color: #0f172a; padding: 36px 24px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Welcome to Enterprise TMS</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">Employee Access Invitation</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <!-- Greeting -->
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Hello, ${employeeName}! 👋
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Welcome to <strong>Enterprise Task Management System</strong>. Your employee account has been created. You can now access your assigned tasks, manage project workflows, and collaborate with your team.
              </p>

              <!-- Profile Details Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 12px 18px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em;">👤 Employee Profile Details</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 14px; color: #64748b; font-weight: 500; width: 40%; border-bottom: 1px solid #f1f5f9;">Employee ID:</td>
                  <td style="padding: 12px 18px; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${resolvedEmployeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 14px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Role:</td>
                  <td style="padding: 12px 18px; font-size: 14px; border-bottom: 1px solid #f1f5f9;">
                    <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">${resolvedRole}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 14px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">Designation:</td>
                  <td style="padding: 12px 18px; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${resolvedDesignation}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 14px; color: #64748b; font-weight: 500;">Department:</td>
                  <td style="padding: 12px 18px; font-size: 14px; color: #0f172a; font-weight: 600;">${resolvedDepartment}</td>
                </tr>
              </table>

              <!-- Access Credentials Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #dbeafe; padding: 12px 18px; border-bottom: 1.5px solid #bfdbfe;">
                    <span style="font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">🔐 Login & Access Credentials</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 14px; color: #3b82f6; font-weight: 600; width: 40%; border-bottom: 1px solid #dbeafe;">Access Email ID:</td>
                  <td style="padding: 12px 18px; font-size: 14px; color: #1e3a8a; font-weight: 700; font-family: monospace; border-bottom: 1px solid #dbeafe;">${employeeEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 14px; color: #3b82f6; font-weight: 600; vertical-align: middle;">Access Password:</td>
                  <td style="padding: 12px 18px; font-size: 14px; vertical-align: middle;">
                    ${password ? `
                    <span style="display: inline-block; background-color: #ffffff; color: #1e293b; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; padding: 6px 12px; border-radius: 6px; border: 1.5px dashed #2563eb; letter-spacing: 0.05em;">${password}</span>
                    ` : `
                    <span style="font-size: 13px; color: #64748b; font-style: italic;">Use your existing password or contact your administrator</span>
                    `}
                  </td>
                </tr>
              </table>

              <!-- CTA Button: Portal Link -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                          <a href="${portalUrl}" target="_blank" style="display: inline-block; padding: 15px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                            🚀 Access Employee Portal &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Portal Direct Link & Instructions -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                  <strong>💡 Getting Started:</strong> Click the button above or visit <a href="${portalUrl}" style="color: #2563eb; text-decoration: underline;">${portalUrl}</a> and log in with your email and access password.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                Automated Welcome Notification &bull; Enterprise Task Management System
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                If you were not expecting this invitation, please contact your administrator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const transport = getTransporter();
    await transport.sendMail({
      from: env.MAIL_FROM,
      to: employeeEmail,
      subject: `Welcome to Enterprise TMS, ${employeeName}! Your Account Details [${resolvedEmployeeId}]`,
      text: `Welcome to Enterprise TMS, ${employeeName}!\n\nYour employee account has been created.\n\nEmployee ID: ${resolvedEmployeeId}\nRole: ${resolvedRole}\nDesignation: ${resolvedDesignation}\nDepartment: ${resolvedDepartment}\n\nLogin Email: ${employeeEmail}\n${password ? `Access Password: ${password}\n` : ''}\nPortal URL: ${portalUrl}\n\nEnterprise Task Management System`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ [EmailService] Failed to send welcome email:', error.message);
    return { success: false, error: error.message };
  }
}
