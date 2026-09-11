import nodemailer from 'nodemailer';
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});

try {
  await transporter.verify();
  console.log('✅ [1/2] SMTP Connection Verified Successfully!');

  const info = await transporter.sendMail({
    from: `"TaskOps Enterprise" <${user}>`,
    to: user,
    subject: '✅ TaskOps Enterprise Email Verification Test',
    text: 'Congratulations! Your TaskOps Enterprise email delivery configuration is working perfectly.',
    html: '<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;"><h2>🎉 TaskOps Email Delivery Works!</h2><p>Your SMTP credentials are authenticated and active.</p></div>',
  });

  console.log('✅ [2/2] Test email dispatched successfully! Message ID:', info.messageId);
  console.log('\n🎉 ALL CHECKS PASSED: Emails will now be sent automatically for onboarding and tasks.');
  process.exit(0);
} catch (error) {
  console.error('❌ SMTP Verification Failed:');
  console.error(`   Error message: ${error.message}\n`);

  if (error.message.includes('534-5.7.9') || error.message.includes('WebLoginRequired')) {
    console.log('================================================================');
    console.log('⚠️ GOOGLE SECURITY CHECK REQUIRED (Error 534-5.7.9):');
    console.log('Google has blocked this connection for one of two quick reasons:');
    console.log('----------------------------------------------------------------');
    console.log('Step 1 (Quickest Fix - Google Unlock Captcha):');
    console.log('   While logged in as "' + user + '" in your browser, open:');
    console.log('   👉 https://accounts.google.com/DisplayUnlockCaptcha');
    console.log('   Click "Continue" to allow app access, then re-run this test.');
    console.log('');
    console.log('Step 2 (Generate New 16-character App Password):');
    console.log('   If Step 1 does not resolve it, open:');
    console.log('   👉 https://myaccount.google.com/apppasswords');
    console.log('   Create a new App Password (name: "TaskOps"), copy the 16 characters,');
    console.log('   and paste it as MAIL_PASSWORD in your server/.env file.');
    console.log('================================================================\n');
  } else if (error.message.includes('535') || error.message.includes('BadCredentials')) {
    console.log('================================================================');
    console.log('⚠️ INVALID CREDENTIALS (Error 535):');
    console.log('The password does not match the Gmail address "' + user + '".');
    console.log('Please ensure the App Password was created specifically for this Gmail account.');
    console.log('================================================================\n');
  }

  process.exit(1);
}
