import nodemailer from 'nodemailer';
import { getAttendanceStatus } from '@/lib/attendance';

export async function sendFacultyAndParentAlert({
  facultyEmail,
  parentEmail,
  studentName,
  percentage,
  courseName,
}: {
  facultyEmail: string;
  parentEmail: string;
  studentName: string;
  percentage: number;
  courseName: string;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    throw new Error('College SMTP configuration is missing. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_FROM in your .env file.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const status = getAttendanceStatus(percentage);
  const statusColor =
    status.tone === 'green' ? '#22c55e' : status.tone === 'blue' ? '#3b82f6' : '#ef4444';

  await transporter.sendMail({
    from: `"Smart Attend" <${smtpFrom}>`,
    to: [facultyEmail, parentEmail].filter(Boolean).join(', '),
    subject: `Attendance ${status.label}: ${studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 16px;">
        <h2 style="margin: 0 0 16px; color: ${statusColor};">Attendance ${status.label}</h2>
        <p>Hello,</p>
        <p>
          The attendance of <strong>${studentName}</strong> in <strong>${courseName}</strong> is
          <strong style="color: ${statusColor};">${percentage.toFixed(1)}%</strong>.
        </p>
        <p>
          Status: <strong style="color: ${statusColor};">${status.label}</strong>
        </p>
        <ul>
          <li>Safe: 75% and above</li>
          <li>Alert: 60% to below 75%</li>
          <li>Warning: below 60%</li>
        </ul>
        <p>Regards,<br />Smart Attend System</p>
      </div>
    `,
  });
}
