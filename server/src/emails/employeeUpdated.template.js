/**
 * Employee Profile Updated Email Template
 */
export function renderEmployeeProfileUpdatedEmail({
  employeeName,
  employeeId = 'EMP',
  updatedFields = {},
  updatedByName = 'Administrator',
}) {
  const fieldRows = Object.entries(updatedFields)
    .map(([key, val]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      return `<tr><td style="padding: 10px 16px; font-size: 13px; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${label}:</td><td style="padding: 10px 16px; font-size: 13px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${val}</td></tr>`;
    })
    .join('');

  const subject = `[Profile Updated] Your TaskOps Account Profile Has Been Updated [${employeeId || 'EMP'}]`;

  const text = `Hello ${employeeName},\n\nYour profile details have been updated by ${updatedByName} in the TaskOps enterprise directory.\n\nTaskOps Enterprise`;

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
              <h1 style="margin: 0; font-size: 18px; font-weight: 700;">Profile Information Updated</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">TaskOps Enterprise Directory</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">Hello <strong>${employeeName}</strong>,</p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">Your employee profile details have been updated by <strong>${updatedByName}</strong> in the enterprise directory.</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 20px;">
                ${fieldRows}
              </table>
              <p style="font-size: 13px; color: #64748b; margin: 0;">If you have any questions regarding these changes, please contact your administrator.</p>
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
