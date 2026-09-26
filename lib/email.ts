import nodemailer from 'nodemailer';
import { getAttendanceStatus } from '@/lib/attendance';

// Bypass TLS certificate chain verification issues in cloud/network proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

  const isGmail = smtpHost.includes('gmail.com') || smtpUser.includes('gmail.com') || smtpUser.includes('bvcgroup.in');

  const transporterOptions = isGmail
    ? {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465 || process.env.SMTP_SECURE === 'true',
        connectionTimeout: 10000,
        socketTimeout: 10000,
        greetingTimeout: 10000,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      };

  const transporter = nodemailer.createTransport(transporterOptions);

  const status = getAttendanceStatus(percentage);
  const statusColor =
    status.tone === 'green' ? '#22c55e' : status.tone === 'blue' ? '#3b82f6' : '#ef4444';

  const subjectHeader = subjectName ? `${subjectName} - ${studentName}` : studentName;

  const recipients = [facultyEmail, parentEmail]
    .map((e) => e?.trim())
    .filter((e): e is string => Boolean(e) && e.includes('@'));

  if (recipients.length === 0) {
    console.warn('No valid recipient emails provided for attendance alert.');
    return;
  }

  const info = await transporter.sendMail({
    from: `"Smart Attend Alert" <${smtpFrom}>`,
    to: recipients.join(', '),
    subject: `⚠️ Low Attendance Alert (${percentage.toFixed(1)}%): ${subjectHeader}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #334155;">
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #334155;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 22px;">Smart Attend - BVC Engineering College</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Automated Institutional Attendance Alert</p>
        </div>
        
        <div style="margin-top: 24px; background: #1e293b; padding: 20px; border-radius: 12px; border-left: 5px solid ${statusColor};">
          <h2 style="margin: 0 0 12px 0; color: ${statusColor}; font-size: 18px;">Attendance Alert Notice</h2>
          <p style="margin: 0 0 8px 0; line-height: 1.5;">
            Student Name: <strong>${studentName}</strong>
          </p>
          <p style="margin: 0 0 8px 0; line-height: 1.5;">
            Course: <strong>${courseName}</strong>
          </p>
          ${subjectName ? `<p style="margin: 0 0 8px 0; line-height: 1.5;">Subject: <strong>${subjectName}</strong></p>` : ''}
          <p style="margin: 0 0 8px 0; line-height: 1.5;">
            Current Attendance: <span style="font-size: 18px; font-weight: bold; color: ${statusColor};">${percentage.toFixed(1)}%</span> (${status.label})
          </p>
        </div>

        <div style="margin-top: 20px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          <p><strong>Note to Parent & Faculty:</strong> Institutional rules mandate a minimum of 75% attendance to qualify for university end-semester examinations. Immediate attendance improvement is advised.</p>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px;">
          Smart Attend System • BVC Engineering College
        </div>
      </div>
    `,
  });

  console.log(`Alert email successfully sent to [${recipients.join(', ')}]. Message ID: ${info.messageId}`);
}
