import { NextResponse } from 'next/server';
import { getAttendanceForDate, markAttendance, markAttendanceBatch } from '@/lib/backend-store';
import { sendFacultyAndParentAlert } from '@/lib/email';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const subject = url.searchParams.get('subject');

  if (!date || !subject || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ success: false, message: 'A valid date and subject are required.' }, { status: 400 });
  }

  return NextResponse.json({ records: await getAttendanceForDate(date, subject) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.subject || !body.facultyEmail || !/^\d{4}-\d{2}-\d{2}$/.test(body.date) || (!Array.isArray(body.records) && (!body.rollNo || typeof body.present !== 'boolean'))) {
      return NextResponse.json(
        { success: false, message: 'Date, subject, faculty email and attendance status are required.' },
        { status: 400 },
      );
    }

    const students = Array.isArray(body.records)
      ? await markAttendanceBatch(body.records, body.subject, body.date)
      : [await markAttendance({ rollNo: body.rollNo, subject: body.subject, present: body.present, date: body.date })];

    const lowAttendanceStudents = students.filter((student) => {
      const subjectRecord = student.subjects.find((s) => s.name.toLowerCase() === body.subject.trim().toLowerCase());
      const subjectPercentage = subjectRecord ? subjectRecord.percentage : student.percentage;
      return student.percentage < 75 || subjectPercentage < 75;
    });

    let emailSentCount = 0;
    if (lowAttendanceStudents.length > 0) {
      for (const student of lowAttendanceStudents) {
        const subjectRecord = student.subjects.find((s) => s.name.toLowerCase() === body.subject.trim().toLowerCase());
        const subjectPercentage = subjectRecord ? subjectRecord.percentage : student.percentage;
        const effectivePercentage = Math.min(student.percentage, subjectPercentage);
        try {
          await sendFacultyAndParentAlert({
            facultyEmail: body.facultyEmail,
            parentEmail: student.parentEmail ?? '',
            studentName: student.name,
            percentage: effectivePercentage,
            courseName: student.course,
            subjectName: body.subject,
          });
          emailSentCount += 1;
          console.log(`Alert email sent for student ${student.name}`);
        } catch (emailErr) {
          console.error(`Failed alert email for ${student.name}:`, emailErr);
        }
      }
    }

    return NextResponse.json({ students, emailSent: emailSentCount });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to mark attendance.' },
      { status: 500 },
    );
  }
}