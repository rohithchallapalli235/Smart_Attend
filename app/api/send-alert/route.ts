import { NextResponse } from 'next/server';
import { sendFacultyAndParentAlert } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { facultyEmail, parentEmail, studentName, percentage, courseName } = body;

    if (!facultyEmail || !parentEmail || !studentName || typeof percentage !== 'number' || percentage < 0 || percentage > 100 || !courseName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields for alert email',
        },
        { status: 400 }
      );
    }

    if (percentage < 75) {
      await sendFacultyAndParentAlert({
        facultyEmail,
        parentEmail,
        studentName,
        percentage,
        courseName,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Alert email processed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}
