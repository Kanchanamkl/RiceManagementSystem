import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { getDistrictStats } from '@/lib/db/analytics';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const context = await requireAuth(request);

    if (!context) {
      return unauthorizedResponse('Please log in to continue');
    }

    const stats = await getDistrictStats();

    // Calculate overall summary
    const totalProduction = stats.reduce((sum, s) => sum + s.production, 0);
    const totalDemand = stats.reduce((sum, s) => sum + s.demand, 0);
    const totalBalance = totalProduction - totalDemand;

    const surplusCount = stats.filter(s => s.status === 'surplus').length;
    const deficitCount = stats.filter(s => s.status === 'deficit').length;
    const balancedCount = stats.filter(s => s.status === 'balanced').length;

    // District-wise totals
    const districtMap = new Map<string, any>();
    stats.forEach(stat => {
      if (!districtMap.has(stat.district)) {
        districtMap.set(stat.district, {
          district: stat.district,
          production: 0,
          demand: 0,
          balance: 0,
        });
      }
      const d = districtMap.get(stat.district)!;
      d.production += stat.production;
      d.demand += stat.demand;
      d.balance += stat.balance;
    });

    const districtSummary = Array.from(districtMap.values());

    // Rice type-wise totals
    const riceTypeMap = new Map<string, any>();
    stats.forEach(stat => {
      if (!riceTypeMap.has(stat.rice_type_id)) {
        riceTypeMap.set(stat.rice_type_id, {
          rice_type_id: stat.rice_type_id,
          rice_type_name: stat.rice_type_name,
          production: 0,
          demand: 0,
          balance: 0,
        });
      }
      const rt = riceTypeMap.get(stat.rice_type_id)!;
      rt.production += stat.production;
      rt.demand += stat.demand;
      rt.balance += stat.balance;
    });

    const riceTypeSummary = Array.from(riceTypeMap.values());

    return successResponse({
      overall: {
        total_production: totalProduction,
        total_demand: totalDemand,
        total_balance: totalBalance,
        surplus_count: surplusCount,
        deficit_count: deficitCount,
        balanced_count: balancedCount,
      },
      by_district: districtSummary,
      by_rice_type: riceTypeSummary,
    });

  } catch (error) {
    console.error('Get analytics summary error:', error);
    return errorResponse('Internal server error', 500);
  }
}
