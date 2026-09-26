import { NextResponse } from 'next/server';
import { getFacultyAssignmentSubmissions, getStudentSubmissions } from '@/lib/learning-store';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const studentEmail = url.searchParams.get('studentEmail');
  const facultyEmail = url.searchParams.get('facultyEmail');

  if (facultyEmail) {
    return NextResponse.json(await getFacultyAssignmentSubmissions(facultyEmail));
  }

  if (studentEmail) {
    return NextResponse.json(await getStudentSubmissions(studentEmail));
  }

  return NextResponse.json({ success: false, message: 'Student or faculty email is required.' }, { status: 400 });
}
