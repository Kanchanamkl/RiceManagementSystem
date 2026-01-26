import { NextRequest, NextResponse } from 'next/server';
import { runPythonScript } from '@/lib/mlClient';

export async function POST(request: NextRequest) {
  try {
    const { district, rice_type } = await request.json();

    if (!district || !rice_type) {
      return NextResponse.json(
        { success: false, error: 'District and rice type required' },
        { status: 400 }
      );
    }

    // Call Python optimization script
    const result = await runPythonScript('optimize_season.py', [district, rice_type]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Optimization API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to optimize' },
      { status: 500 }
    );
  }
}
