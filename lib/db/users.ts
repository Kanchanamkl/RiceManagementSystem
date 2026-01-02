import { query } from './connection';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function createUserProfile(data: {
  email: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
  password_hash: string;
}) {
  const result = await query<UserProfile>(
    `INSERT INTO users (email, name, role, district, phone, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.email, data.name, data.role, data.district, data.phone, data.password_hash]
  );

  return result.rows[0];
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await query<UserProfile>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const result = await query<UserProfile>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query<UserProfile>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const result = await query<UserProfile>(
    'SELECT * FROM users ORDER BY created_at DESC'
  );

  return result.rows;
}

export async function deleteUser(userId: string) {
  await query('DELETE FROM users WHERE id = $1', [userId]);
}
