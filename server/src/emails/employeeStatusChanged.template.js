/**
 * Employee Status Changed (Activated / Deactivated) Email Template
 */
export function renderEmployeeStatusChangedEmail({
  employeeName,
  isActive,
  updatedByName = 'Administrator',
}) {
  const statusText = isActive ? 'ACTIVATED' : 'DEACTIVATED';
  const statusColor = isActive ? '#16a34a' : '#dc2626';

  const subject = `[Account ${statusText}] TaskOps Portal Access Notification`;

  const text = `Hello ${employeeName},\n\nYour TaskOps portal access has been ${statusText} by ${updatedByName}.\n\n${isActive ? 'You can now log in to the portal and access your assigned tasks.' : 'Your portal access is currently suspended. Please reach out to management for assistance.'}\n\nTaskOps Enterprise`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: #0f172a; padding: 24px 28px; color: #fff;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 700;">Account Access Notification</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">TaskOps Security & Permissions</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">Hello <strong>${employeeName}</strong>,</p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">
                Your TaskOps enterprise portal access has been <span style="color: ${statusColor}; font-weight: 700;">${statusText}</span> by <strong>${updatedByName}</strong>.
              </p>
              <p style="font-size: 13px; color: #64748b; margin: 0;">
                ${isActive ? 'You can now log in to the portal and access your assigned tasks.' : 'Your portal access is currently suspended. Please reach out to management if you believe this is in error.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
              Automated notification from TaskOps Enterprise Management System.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
