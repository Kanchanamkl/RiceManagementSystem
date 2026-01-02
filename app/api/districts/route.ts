import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/connection';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    // Get unique districts from productions table
    const result = await query(`
      SELECT DISTINCT district 
      FROM productions 
      WHERE district IS NOT NULL AND district != ''
      ORDER BY district ASC
    `);

    // Also get districts from users table
    const userDistricts = await query(`
      SELECT DISTINCT district 
      FROM users 
      WHERE district IS NOT NULL AND district != '' AND role = 'farmer'
      ORDER BY district ASC
    `);

    // Combine and deduplicate districts
    const allDistricts = new Set([
      ...result.rows.map(row => row.district),
      ...userDistricts.rows.map(row => row.district)
    ]);

    // Add standard Sri Lankan districts that might not be in the database yet
    const standardDistricts = [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Monaragala', 'Ratnapura', 'Kegalle'
    ];

    standardDistricts.forEach(district => allDistricts.add(district));

    const districts = Array.from(allDistricts).sort();

    return successResponse(districts);
  } catch (error) {
    console.error('Fetch districts error:', error);
    return errorResponse('Internal server error', 500);
  }
}
