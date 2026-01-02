import { cookies } from 'next/headers';

interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'farmer';
}

export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  
  const sessionData = JSON.stringify({
    userId: data.userId,
    email: data.email,
    role: data.role,
    createdAt: new Date().toISOString(),
  });

  cookieStore.set('session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    return {
      userId: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
    };
  } catch (error) {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
