import { NextResponse } from 'next/server';
import { createStudent, deleteStudent, getStudents, updateStudent } from '@/lib/backend-store';

export async function GET() {
  return NextResponse.json(await getStudents());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.rollNo || !body.course || !body.email || !body.parentEmail || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student name, roll number, course, student email, parent email and password are required.',
        },
        { status: 400 }
      );
    }

    const student = await createStudent({
      name: body.name,
      rollNo: body.rollNo,
      course: body.course,
      email: body.email,
      parentEmail: body.parentEmail,
      password: body.password,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to create student record.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.rollNo || !body.name || !body.course || !body.email || !body.parentEmail) {
      return NextResponse.json({ success: false, message: 'Roll number, name, course and email fields are required.' }, { status: 400 });
    }

    return NextResponse.json(await updateStudent(body.rollNo, body));
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to update student.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.rollNo) return NextResponse.json({ success: false, message: 'Roll number is required.' }, { status: 400 });
    await deleteStudent(body.rollNo);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to delete student.' }, { status: 500 });
  }
}
