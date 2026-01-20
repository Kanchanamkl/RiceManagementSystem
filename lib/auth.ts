import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: string;
  district?: string;
}

export async function signToken(payload: UserPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return token;
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
}
