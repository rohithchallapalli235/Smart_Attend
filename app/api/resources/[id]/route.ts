import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getResourceFile } from '@/lib/learning-store';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const resource = await getResourceFile(Number(params.id));
  if (!resource) return NextResponse.json({ success: false, message: 'Resource not found.' }, { status: 404 });

  const file = await readFile(resource.filePath);
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${resource.fileName.replace(/"/g, '')}"`,
    },
  });
}
