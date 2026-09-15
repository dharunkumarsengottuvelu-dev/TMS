/**
 * Task Status Updated Email Template (Sent to Admin)
 */
export function renderTaskStatusUpdatedEmail({
  adminName = 'Administrator',
  employeeName,
  taskTitle,
  previousStatus,
  newStatus,
  updatedDate = new Date(),
  comment = null,
  portalUrl = 'http://localhost:5173',
}) {
  const formattedDate = new Date(updatedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColors = {
    NOT_STARTED: '#64748b',
    PENDING: '#d97706',
    IN_PROGRESS: '#0284c7',
    COMPLETED: '#16a34a',
  };

  const newColor = statusColors[newStatus] || '#0f172a';
  const cleanPrev = (previousStatus || '').replace(/_/g, ' ');
  const cleanNew = (newStatus || '').replace(/_/g, ' ');

  const subject = `Task Status Updated: ${taskTitle}`;

  const text = `Hello ${adminName},\n\nEmployee ${employeeName} has updated the status of the task "${taskTitle}".\n\nPrevious Status: ${cleanPrev}\nNew Status: ${cleanNew}\nTimestamp: ${formattedDate}${comment ? `\nComment/Notes: ${comment}` : ''}\n\nReview in Task Management System: ${portalUrl}`;

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
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 20px 0; }
    .meta-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .meta-table td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .meta-label { color: #64748b; font-weight: 500; width: 35%; }
    .meta-value { color: #0f172a; font-weight: 600; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #ffffff; }
    .cta-container { text-align: center; margin: 24px 0 12px; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Task Status Update Notification</h1>
      <p>Automatic Workflow Event</p>
    </div>
    <div class="content">
      <p>Hello <strong>${adminName}</strong>,</p>
      <p>Employee <strong>${employeeName}</strong> has updated the status of an assigned task.</p>
      
      <div class="card">
        <table class="meta-table">
          <tr><td class="meta-label">Task:</td><td class="meta-value">${taskTitle}</td></tr>
          <tr><td class="meta-label">Updated By:</td><td class="meta-value">${employeeName}</td></tr>
          <tr><td class="meta-label">Previous Status:</td><td class="meta-value" style="color: #64748b;">${cleanPrev}</td></tr>
          <tr><td class="meta-label">New Status:</td><td class="meta-value"><span class="badge" style="background:${newColor}">${cleanNew}</span></td></tr>
          <tr><td class="meta-label">Timestamp:</td><td class="meta-value">${formattedDate}</td></tr>
          ${comment ? `<tr><td class="meta-label">Notes:</td><td class="meta-value">${comment}</td></tr>` : ''}
        </table>
      </div>

      <div class="cta-container">
        <a href="${portalUrl}/admin/tasks" class="btn" target="_blank">Review in Admin Dashboard &rarr;</a>
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
