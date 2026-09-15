import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const user = process.env.MAIL_USER || 'taskmanagemtsystem.info@gmail.com';
const pass = (process.env.MAIL_PASSWORD || '').replace(/\s+/g, '');

console.log('----------------------------------------------------');
console.log('📧 TaskOps SMTP Mail Delivery Verification Diagnostic');
console.log('----------------------------------------------------');
console.log(`User:      ${user}`);
console.log(`Password:  ${pass ? pass.slice(0, 4) + '********' + pass.slice(-4) : '(EMPTY)'}`);
console.log('Connecting to smtp.gmail.com...\n');

import { safeSendMail } from '../services/emailService.js';

console.log('Testing email delivery through application pipeline (safeSendMail)...');

const result = await safeSendMail({
  from: `"TaskOps Enterprise" <${user}>`,
  to: user,
  subject: '✅ TaskOps Enterprise Email Delivery Verification Test',
  text: 'Your TaskOps email delivery is working.',
  html: '<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;"><h2>🎉 TaskOps Email Delivery Works!</h2><p>Your email notification pipeline is active and working.</p></div>',
});

if (result.success) {
  console.log('\n🎉 ALL CHECKS PASSED: Emails are sending properly!');
  if (result.previewUrl) {
    console.log('🔗 Click to View Rendered Test Email in Browser:', result.previewUrl);
  }
  process.exit(0);
} else {
  console.error('❌ Failed:', result.error);
  process.exit(1);
}
