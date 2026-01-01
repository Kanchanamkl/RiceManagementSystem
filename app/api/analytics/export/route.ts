import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getDistrictStats, generateCSV } from '@/lib/db/analytics';
import { unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || undefined;
    const rice_type_id = searchParams.get('rice_type_id') || undefined;
    const status = searchParams.get('status') || undefined;

    const stats = await getDistrictStats({
      district,
      rice_type_id,
      status,
    });

    // Generate CSV
    const columns = [
      'district',
      'rice_type_name',
      'production',
      'demand',
      'balance',
      'status',
    ];

    const csv = generateCSV(stats, columns);

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rice-stocks-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export CSV error:', error);
    return errorResponse('Internal server error', 500);
  }
}
