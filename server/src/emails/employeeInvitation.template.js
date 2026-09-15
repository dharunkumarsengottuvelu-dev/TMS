/**
 * Employee Onboarding / Welcome / Invitation Email Template
 */
export function renderEmployeeInvitationEmail({
  employeeName,
  employeeEmail,
  employeeId = 'EMP-1001',
  role = 'EMPLOYEE',
  department = 'General',
  designation = 'Team Member',
  password = null,
  loginUrl = 'http://localhost:5173',
  isResend = false,
}) {
  const portalUrl = loginUrl.endsWith('/login') ? loginUrl : `${loginUrl}/login`;
  const resolvedRole = role || 'EMPLOYEE';
  const resolvedDesignation = designation || 'Team Member';
  const resolvedDepartment = department || 'General';
  const resolvedEmployeeId = employeeId || 'EMP-1001';

  const subject = isResend
    ? `TaskOps Account Invitation (Resent): Welcome ${employeeName} [${resolvedEmployeeId}]`
    : `Welcome to Enterprise TMS, ${employeeName}! Your Account Details [${resolvedEmployeeId}]`;

  const text = `Welcome to Enterprise TMS, ${employeeName}!\n\nYour employee account has been created in the TaskOps Enterprise Directory.\n\nEmployee ID: ${resolvedEmployeeId}\nRole: ${resolvedRole}\nDesignation: ${resolvedDesignation}\nDepartment: ${resolvedDepartment}\n\nLogin Email: ${employeeEmail}\n${password ? `Temporary Access Password: ${password}\n` : ''}\nPortal URL: ${portalUrl}\n\nPlease sign in to access your assigned tasks and workflows.\n\nEnterprise Task Management System`;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); background-color: #0f172a; padding: 36px 24px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Welcome to Enterprise TMS</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">
                ${isResend ? 'Employee Invitation Reminder' : 'Employee Access Invitation'}
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
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
                    <span style="font-size: 13px; color: #64748b; font-style: italic;">Use your existing account password</span>
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

              <!-- Instructions -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                  <strong>💡 Getting Started:</strong> Click the button above or navigate to <a href="${portalUrl}" style="color: #2563eb; text-decoration: underline;">${portalUrl}</a> and log in using your registered email.
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

  return { subject, text, html };
}
