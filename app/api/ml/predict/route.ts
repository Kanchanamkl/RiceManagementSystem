import { NextRequest, NextResponse } from 'next/server';
import { runPythonScript } from '@/lib/mlClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { district, rice_type, season } = body;

    console.log('Received prediction request:', { district, rice_type, season });

    // Validate inputs
    if (!district || !rice_type || !season) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${!district ? 'district ' : ''}${!rice_type ? 'rice_type ' : ''}${!season ? 'season' : ''}`.trim()
        },
        { status: 400 }
      );
    }

    // Call Python script
    const result = await runPythonScript('predict.py', [
      district,
      rice_type,
      season
    ]);

    console.log('Python script result:', result);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Prediction failed' },
        { status: 500 }
      );
    }

    // Extract the data and ensure it's a plain object
    const predictionData = {
      success: Boolean(result.data.success),
      predicted_quantity: Number(result.data.predicted_quantity),
      confidence: Number(result.data.confidence),
      district: String(result.data.district),
      rice_type: String(result.data.rice_type),
      season: String(result.data.season),
      is_future_prediction: Boolean(result.data.is_future_prediction),
      note: result.data.note ? String(result.data.note) : undefined
    };

    // Return the clean object
    return NextResponse.json(predictionData);

  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}