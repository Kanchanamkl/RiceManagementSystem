import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile, getUserByEmail } from '@/lib/db/users';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, district, phone } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (role !== 'farmer') {
      return NextResponse.json(
        { error: 'Only farmer registration is allowed' },
        { status: 400 }
      );
    }

    if (!district) {
      return NextResponse.json(
        { error: 'District is required for farmer registration' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await createUserProfile({
      email,
      name,
      role: 'farmer',
      district,
      phone: phone || undefined,
      password_hash,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please login to continue.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        district: user.district,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}