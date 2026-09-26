import { NextResponse } from 'next/server';
import { getStudentSubmissions } from '@/lib/learning-store';

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('studentEmail');
  if (!email) return NextResponse.json({ success: false, message: 'Student email is required.' }, { status: 400 });
  return NextResponse.json(await getStudentSubmissions(email));
}
