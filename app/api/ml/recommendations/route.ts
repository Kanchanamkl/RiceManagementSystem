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
    const { district } = await request.json();
    
    // Validate input
    if (!district) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: district' },
        { status: 400 }
      );
    }
    
    // Run recommendations script
    const result = await runPythonScript('recommendations.py', [district]);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get recommendations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
    
  } catch (error: any) {
    console.error('ML Recommendations API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
