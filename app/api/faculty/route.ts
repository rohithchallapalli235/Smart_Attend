import { NextResponse } from 'next/server';
import { createFaculty, deleteFaculty, getFaculty, updateFaculty } from '@/lib/backend-store';

export async function GET() {
  return NextResponse.json(await getFaculty());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.subject || !body.facultyEmail || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faculty name, subject, faculty email and password are required.',
        },
        { status: 400 }
      );
    }

    const faculty = await createFaculty({
      name: body.name,
      subject: body.subject,
      facultyEmail: body.facultyEmail,
      password: body.password,
    });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to create faculty record.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.originalEmail || !body.name || !body.subject || !body.facultyEmail) {
      return NextResponse.json({ success: false, message: 'Original email, name, subject and faculty email are required.' }, { status: 400 });
    }

    return NextResponse.json(await updateFaculty(body.originalEmail, body));
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to update faculty.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.facultyEmail) return NextResponse.json({ success: false, message: 'Faculty email is required.' }, { status: 400 });
    await deleteFaculty(body.facultyEmail);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to delete faculty.' }, { status: 500 });
  }
}
