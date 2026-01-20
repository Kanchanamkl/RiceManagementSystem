import { NextRequest, NextResponse } from 'next/server';
import { runPythonScript } from '@/lib/mlClient';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await verifyToken(token);
    
    const body = await request.json();
    const { district } = body;

    if (!district) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: district' },
        { status: 400 }
      );
    }

    // Call Python script
    const result = await runPythonScript('recommendations.py', [district]);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}