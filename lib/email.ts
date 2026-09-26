import nodemailer from 'nodemailer';
import { getAttendanceStatus } from '@/lib/attendance';

export async function sendFacultyAndParentAlert({
  facultyEmail,
  parentEmail,
  studentName,
  percentage,
  courseName,
  subjectName,
}: {
  facultyEmail: string;
  parentEmail: string;
  studentName: string;
  percentage: number;
  courseName: string;
  subjectName?: string;
}) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || '24221a0550@bvcgroup.in';
  const smtpPassword = (process.env.SMTP_PASSWORD || 'khmo hghw bgdf worp').replace(/\s+/g, '');
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true',
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true',
    },
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const status = getAttendanceStatus(percentage);
  const statusColor =
    status.tone === 'green' ? '#22c55e' : status.tone === 'blue' ? '#3b82f6' : '#ef4444';

  const subjectHeader = subjectName ? `${subjectName} (${studentName})` : studentName;

  await transporter.sendMail({
    from: `"Smart Attend" <${smtpFrom}>`,
    to: [facultyEmail, parentEmail].filter(Boolean).join(', '),
    subject: `Low Attendance Alert - ${status.label}: ${subjectHeader}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 16px;">
        <h2 style="margin: 0 0 16px; color: ${statusColor};">Attendance Alert: Below 75%</h2>
        <p>Hello,</p>
        <p>
          This is an automated attendance alert from <strong>Smart Attend</strong> for student <strong>${studentName}</strong> (${courseName}).
        </p>
        ${subjectName ? `<p>Subject: <strong>${subjectName}</strong></p>` : ''}
        <p>
          Current Attendance: <strong style="color: ${statusColor};">${percentage.toFixed(1)}%</strong> (${status.label})
        </p>
        <div style="margin: 20px 0; padding: 16px; background: #1e293b; border-radius: 12px; border-left: 4px solid ${statusColor};">
          <p style="margin: 0; font-size: 14px;">Institutional Requirement: Minimum 75% attendance is required to be eligible for semester examinations.</p>
        </div>
        <p>Regards,<br />Smart Attend System - BVC Engineering College</p>
      </div>
    `,
  });
}
