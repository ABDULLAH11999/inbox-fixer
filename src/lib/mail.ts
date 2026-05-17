import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASSWORD || '';
const smtpFrom = process.env.SMTP_FROM || '"InboxFixer" <alerts@inboxfixer.com>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP is not fully configured in environment variables. Email printing to console:');
    console.log(`--- EMAIL TO: ${to} ---`);
    console.log(`--- SUBJECT: ${subject} ---`);
    console.log(html);
    console.log('------------------------');
    return { success: true, printed: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const info = await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
}
