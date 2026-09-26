import { NextResponse } from 'next/server';
import { createAssignment, getAssignments } from '@/lib/learning-store';

export async function GET(request: Request) {
  const assignments = await getAssignments();
  const viewer = new URL(request.url).searchParams.get('viewer');
  if (viewer === 'student') {
    return NextResponse.json(assignments.map((assignment) => ({
      ...assignment,
      questions: assignment.questions.map(({ answer: _answer, ...question }) => question),
    })));
  }
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.subject || !body.facultyEmail || !Array.isArray(body.questions) || !body.questions.length) {
      return NextResponse.json({ success: false, message: 'Title, subject, faculty email and questions are required.' }, { status: 400 });
    }

    const questions = body.questions.map((question: { prompt: string; options: string[]; answer: number }) => ({
      prompt: String(question.prompt).trim(),
      options: question.options.map((option) => String(option).trim()),
      answer: Number(question.answer),
    }));
    if (questions.some((question: AssignmentQuestion) => !question.prompt || question.options.length !== 4 || question.options.some((option) => !option) || question.answer < 0 || question.answer > 3)) {
      return NextResponse.json({ success: false, message: 'Each question needs four options and a valid answer.' }, { status: 400 });
    }

    return NextResponse.json(await createAssignment({ title: body.title.trim(), subject: body.subject.trim(), facultyEmail: body.facultyEmail.trim().toLowerCase(), questions }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to create assignment.' }, { status: 500 });
  }
}

type AssignmentQuestion = { prompt: string; options: string[]; answer: number };
