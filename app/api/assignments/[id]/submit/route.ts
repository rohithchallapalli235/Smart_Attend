import { NextResponse } from 'next/server';
import { submitAssignment } from '@/lib/learning-store';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (!body.studentEmail || !Array.isArray(body.answers)) {
      return NextResponse.json({ success: false, message: 'Student email and answers are required.' }, { status: 400 });
    }

    return NextResponse.json(await submitAssignment({ assignmentId: Number(params.id), studentEmail: body.studentEmail, answers: body.answers }));
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to submit assignment.' }, { status: 500 });
  }
}
