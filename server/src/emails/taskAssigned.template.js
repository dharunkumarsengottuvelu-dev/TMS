/**
 * Task Assignment Email Template
 */
export function renderTaskAssignedEmail({
  employeeName,
  taskTitle,
  taskDescription,
  priority = 'MEDIUM',
  status = 'NOT_STARTED',
  assignedByName = 'Administrator',
  assignedDate = new Date(),
  dueDate = null,
  portalUrl = 'http://localhost:5173',
}) {
  const formattedAssigned = new Date(assignedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'No strict due date set';

  const priorityColors = {
    HIGH: '#dc2626',
    MEDIUM: '#d97706',
    LOW: '#2563eb',
  };
  const badgeColor = priorityColors[priority] || '#4b5563';
  const cleanStatus = (status || 'NOT_STARTED').replace(/_/g, ' ');

  const subject = `New Task Assigned: ${taskTitle}`;

  const text = `Hello ${employeeName},\n\nYou have been assigned a new task: "${taskTitle}"\nPriority: ${priority}\nStatus: ${cleanStatus}\nDue Date: ${formattedDue}\nAssigned By: ${assignedByName}\n\nDescription:\n${taskDescription || 'No description provided'}\n\nAccess the Task Management System: ${portalUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    .content { padding: 32px; }
    .greeting { font-size: 16px; margin: 0 0 16px; color: #0f172a; }
    .task-card { background: #f1f5f9; border-left: 4px solid #0284c7; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .task-title { font-size: 18px; font-weight: 700; margin: 0 0 8px; color: #0f172a; }
    .task-desc { margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569; }
    .meta-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .meta-table td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .meta-label { color: #64748b; font-weight: 500; width: 35%; }
    .meta-value { color: #0f172a; font-weight: 600; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #ffffff; }
    .cta-container { text-align: center; margin: 28px 0 12px; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Enterprise Task Management System</h1>
      <p>Automatic Task Assignment Notification</p>
    </div>
    <div class="content">
      <p class="greeting">Hello <strong>${employeeName}</strong>,</p>
      <p>You have been assigned a new task by <strong>${assignedByName}</strong>.</p>
      
      <div class="task-card">
        <div class="task-title">${taskTitle}</div>
        <div class="task-desc">${taskDescription || 'No description provided.'}</div>
        <table class="meta-table">
          <tr><td class="meta-label">Priority:</td><td class="meta-value"><span class="badge" style="background:${badgeColor}">${priority}</span></td></tr>
          <tr><td class="meta-label">Status:</td><td class="meta-value">${cleanStatus}</td></tr>
          <tr><td class="meta-label">Due Date:</td><td class="meta-value">${formattedDue}</td></tr>
          <tr><td class="meta-label">Assigned Date:</td><td class="meta-value">${formattedAssigned}</td></tr>
          <tr><td class="meta-label">Assigned By:</td><td class="meta-value">${assignedByName}</td></tr>
        </table>
      </div>

      <div class="cta-container">
        <a href="${portalUrl}" class="btn" target="_blank">View Task in Portal &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Automated notification from TaskOps Enterprise Management System.<br>
      Please do not reply directly to this automated email.
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
