import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { runPythonScript } from '@/lib/mlClient';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { district, rice_type, season } = await request.json();
    
    // Validate inputs
    if (!district || !rice_type || !season) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: district, rice_type, season' },
        { status: 400 }
      );
    }
    
    // Run prediction script
    const result = await runPythonScript('predict.py', [district, rice_type, season]);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Prediction failed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
    
  } catch (error: any) {
    console.error('ML Predict API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
