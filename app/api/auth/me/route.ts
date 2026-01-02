import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserProfile } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const user = await getUserProfile(session.userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          district: user.district,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
