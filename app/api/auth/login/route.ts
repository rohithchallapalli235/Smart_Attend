import { NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/backend-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password } = body ?? {};

    if (!role || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Role, email and password are required.',
        },
        { status: 400 }
      );
    }

    if (!(await verifyLogin({ role, email, password }))) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials for the selected role.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      role,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed.',
      },
      { status: 500 }
    );
  }
}
