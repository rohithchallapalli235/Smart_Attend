import { NextResponse } from 'next/server';
import { getStudents } from '@/lib/backend-store';

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET() {
  const students = await getStudents();
  const rows = students.flatMap((student) => student.subjects.length
    ? student.subjects.map((subject) => [
      student.name,
      student.rollNo,
      student.course,
      student.email ?? '',
      subject.name,
      subject.present,
      subject.total,
      subject.percentage.toFixed(1),
      student.percentage.toFixed(1),
    ])
    : [[student.name, student.rollNo, student.course, student.email ?? '', '', 0, 0, '0.0', student.percentage.toFixed(1)]]);
  const header = ['Student name', 'Roll number', 'Course', 'Student email', 'Subject', 'Present', 'Total classes', 'Subject percentage', 'Overall percentage'];
  const csv = [header, ...rows].map((row) => row.map(csvValue).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bvc-engineering-college-attendance-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
