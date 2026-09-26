import { NextResponse } from 'next/server';
import { createResource, getResources } from '@/lib/learning-store';

export async function GET() {
  return NextResponse.json(await getResources());
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = String(formData.get('title') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const facultyEmail = String(formData.get('facultyEmail') ?? '').trim().toLowerCase();
    const file = formData.get('file');

    if (!title || !subject || !facultyEmail || !(file instanceof File) || file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'Title, subject, faculty email and a PDF file are required.' }, { status: 400 });
    }

    const created = await createResource({ title, subject, facultyEmail, fileName: file.name, file: Buffer.from(await file.arrayBuffer()) });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Unable to upload resource.' }, { status: 500 });
  }
}
