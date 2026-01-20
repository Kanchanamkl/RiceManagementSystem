'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';

const DISTRICTS = [
  'Ampara',
  'Polonnaruwa',
  'Hambantota',
  'Anuradhapura',
  'Kurunegala',
  'Batticaloa',
  'Trincomalee'
];

interface RiceType {
  id: number;
  name: string;
}

interface Season {
  id: number;
  name: string;
}

interface PredictionResult {
  success: boolean;
  predicted_quantity: number;
  confidence: number;
  district: string;
  rice_type: string;
  season: string;
  is_future_prediction?: boolean;
  note?: string;
}

export default function PredictionsPage() {
  const [district, setDistrict] = useState('');
  const [riceType, setRiceType] = useState('');
  const [season, setSeason] = useState('');
  const [riceTypes, setRiceTypes] = useState<RiceType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [riceTypesRes, seasonsRes] = await Promise.all([
        fetch('/api/rice-types'),
        fetch('/api/seasons')
      ]);

      const riceTypesData = await riceTypesRes.json();
      const seasonsData = await seasonsRes.json();

      if (riceTypesData.success) setRiceTypes(riceTypesData.data || []);
      if (seasonsData.success) setSeasons(seasonsData.data || []);
    } catch (err) {
      console.error('Failed to fetch options:', err);
      setError('Failed to load form options');
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    console.log('Sending prediction request:', { district, rice_type: riceType, season });

    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          district: district,
          rice_type: riceType,
          season: season
        })
      });

      const data = await response.json();
      console.log('Prediction response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Prediction failed');
      }

      setPrediction(data.data || data);
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-green-600" />
          Production Predictions
        </h1>
        <p className="text-gray-600 mt-2">
          Get AI-powered predictions for rice production based on district, rice type, and season
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Prediction Form</h2>
          
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select district...</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rice Type <span className="text-red-500">*</span>
              </label>
              <select
                value={riceType}
                onChange={(e) => setRiceType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select rice type...</option>
                {riceTypes.map((rt) => (
                  <option key={rt.id} value={rt.name}>{rt.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season <span className="text-red-500">*</span>
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select season...</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !district || !riceType || !season}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Get Prediction
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </Card>

        {prediction && (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h2 className="text-xl font-semibold mb-4 text-green-900">
              Prediction Results
            </h2>
            
            {prediction.is_future_prediction && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ {prediction.note || 'This is a future prediction based on historical patterns'}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Predicted Production</p>
                <p className="text-4xl font-bold text-green-600">
                  {prediction.predicted_quantity?.toLocaleString() || 0} kg
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${prediction.confidence || 0}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {prediction.confidence?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">District:</span>
                  <span className="font-semibold">{prediction.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rice Type:</span>
                  <span className="font-semibold">{prediction.rice_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Season:</span>
                  <span className="font-semibold">{prediction.season}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}