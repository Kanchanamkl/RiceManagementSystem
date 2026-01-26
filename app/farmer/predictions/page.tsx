'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, TrendingUp, AlertCircle, BarChart3, Calendar, Lightbulb, RefreshCw } from 'lucide-react';

const DISTRICTS = [
  'Ampara', 'Polonnaruwa', 'Hambantota', 'Anuradhapura', 
  'Kurunegala', 'Batticaloa', 'Trincomalee'
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

interface ComparisonResult {
  rice_type: string;
  predicted_quantity: number;
  confidence: number;
  ranking: number;
}

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'compare' | 'trends' | 'optimize'>('single');
  
  // Single Prediction States
  const [district, setDistrict] = useState('');
  const [riceType, setRiceType] = useState('');
  const [season, setSeason] = useState('');
  const [riceTypes, setRiceTypes] = useState<RiceType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');

  // Comparison States
  const [compareDistrict, setCompareDistrict] = useState('');
  const [compareSeason, setCompareSeason] = useState('');
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  // Trend Analysis States
  const [trendDistrict, setTrendDistrict] = useState('');
  const [trendRiceType, setTrendRiceType] = useState('');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // Optimization States
  const [optimizeDistrict, setOptimizeDistrict] = useState('');
  const [optimizeRiceType, setOptimizeRiceType] = useState('');
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);

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
    }
  };

  // Single Prediction Handler
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, rice_type: riceType, season })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Prediction failed');
      }

      setPrediction(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  // Comparison Handler
  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompareLoading(true);
    setError('');
    setComparisons([]);

    try {
      const promises = riceTypes.map(rt =>
        fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            district: compareDistrict,
            rice_type: rt.name,
            season: compareSeason
          })
        }).then(r => r.json())
      );

      const results = await Promise.all(promises);
      
      const formatted = results
        .filter(r => r.success)
        .map((r, idx) => ({
          rice_type: r.rice_type,
          predicted_quantity: r.predicted_quantity,
          confidence: r.confidence,
          ranking: idx + 1
        }))
        .sort((a, b) => b.predicted_quantity - a.predicted_quantity)
        .map((item, idx) => ({ ...item, ranking: idx + 1 }));

      setComparisons(formatted);
    } catch (err: any) {
      setError('Failed to compare predictions');
    } finally {
      setCompareLoading(false);
    }
  };

  // Trend Analysis Handler
  const handleTrendAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrendLoading(true);
    setTrendData([]);

    try {
      const response = await fetch('/api/ml/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: trendDistrict,
          rice_type: trendRiceType
        })
      });

      const data = await response.json();
      if (data.success) {
        setTrendData(data.trends || []);
      }
    } catch (err) {
      setError('Failed to fetch trend data');
    } finally {
      setTrendLoading(false);
    }
  };

  // Optimization Handler
  const handleOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    setOptimizeLoading(true);
    setOptimizationResults(null);

    try {
      const response = await fetch('/api/ml/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: optimizeDistrict,
          rice_type: optimizeRiceType
        })
      });

      const data = await response.json();
      if (data.success) {
        setOptimizationResults(data);
      }
    } catch (err) {
      setError('Failed to get optimization suggestions');
    } finally {
      setOptimizeLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-green-600" />
          ML-Powered Production Intelligence
        </h1>
        <p className="text-gray-600 mt-2">
          Advanced machine learning predictions and analytics for rice production
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          <TabButton
            active={activeTab === 'single'}
            onClick={() => setActiveTab('single')}
            icon={<TrendingUp className="w-5 h-5" />}
            label="Single Prediction"
          />
          {/* <TabButton
            active={activeTab === 'compare'}
            onClick={() => setActiveTab('compare')}
            icon={<BarChart3 className="w-5 h-5" />}
            label="Compare Varieties"
          />
          <TabButton
            active={activeTab === 'trends'}
            onClick={() => setActiveTab('trends')}
            icon={<RefreshCw className="w-5 h-5" />}
            label="Trend Analysis"
          /> */}
          <TabButton
            active={activeTab === 'optimize'}
            onClick={() => setActiveTab('optimize')}
            icon={<Lightbulb className="w-5 h-5" />}
            label="Best Season"
          />
        </div>
      </div>

      {/* Single Prediction Tab */}
      {activeTab === 'single' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Production Prediction</h2>
            
            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
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
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
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
                    ℹ️ {prediction.note || 'Based on historical patterns'}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Predicted Production</p>
                  <p className="text-4xl font-bold text-green-600">
                    {prediction.predicted_quantity?.toLocaleString()} kg
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">Confidence Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${prediction.confidence}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold text-green-600 min-w-[60px]">
                      {prediction.confidence?.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {prediction.confidence >= 90 ? '✓ High confidence' :
                     prediction.confidence >= 85 ? '⚠ Moderate confidence' :
                     '⚠ Lower confidence (limited data)'}
                  </p>
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
      )}

      {/* Compare Tab */}
      {activeTab === 'compare' && (
        <CompareVarietiesTab
          compareDistrict={compareDistrict}
          setCompareDistrict={setCompareDistrict}
          compareSeason={compareSeason}
          setCompareSeason={setCompareSeason}
          compareLoading={compareLoading}
          comparisons={comparisons}
          handleCompare={handleCompare}
          seasons={seasons}
          error={error}
        />
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <TrendAnalysisTab
          trendDistrict={trendDistrict}
          setTrendDistrict={setTrendDistrict}
          trendRiceType={trendRiceType}
          setTrendRiceType={setTrendRiceType}
          trendLoading={trendLoading}
          trendData={trendData}
          handleTrendAnalysis={handleTrendAnalysis}
          riceTypes={riceTypes}
        />
      )}

      {/* Optimize Tab */}
      {activeTab === 'optimize' && (
        <OptimizationTab
          optimizeDistrict={optimizeDistrict}
          setOptimizeDistrict={setOptimizeDistrict}
          optimizeRiceType={optimizeRiceType}
          setOptimizeRiceType={setOptimizeRiceType}
          optimizeLoading={optimizeLoading}
          optimizationResults={optimizationResults}
          handleOptimization={handleOptimization}
          riceTypes={riceTypes}
        />
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
        active
          ? 'border-green-600 text-green-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Compare Varieties Component
function CompareVarietiesTab({ compareDistrict, setCompareDistrict, compareSeason, setCompareSeason, compareLoading, comparisons, handleCompare, seasons, error }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Compare All Rice Varieties</h2>
        <p className="text-sm text-gray-600 mb-4">
          See which rice type yields the best production for your selected district and season
        </p>

        <form onSubmit={handleCompare} className="grid md:grid-cols-3 gap-4">
          <select
            value={compareDistrict}
            onChange={(e) => setCompareDistrict(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select district...</option>
            {['Ampara', 'Polonnaruwa', 'Hambantota', 'Anuradhapura', 'Kurunegala', 'Batticaloa', 'Trincomalee'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={compareSeason}
            onChange={(e) => setCompareSeason(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select season...</option>
            {seasons.map((s: any) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={compareLoading}
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {compareLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Compare All
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </Card>

      {comparisons.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {comparisons.map((comp, idx) => (
            <Card
              key={idx}
              className={`p-6 ${
                idx === 0
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 ring-2 ring-yellow-400'
                  : idx === 1
                  ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300'
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">Rank #{comp.ranking}</p>
                  <h3 className="text-lg font-bold">{comp.rice_type}</h3>
                </div>
                {idx === 0 && <span className="text-2xl">🥇</span>}
                {idx === 1 && <span className="text-2xl">🥈</span>}
                {idx === 2 && <span className="text-2xl">🥉</span>}
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Predicted Yield</p>
                  <p className="text-2xl font-bold text-green-600">
                    {comp.predicted_quantity.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-lg font-semibold">{comp.confidence.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Trend Analysis Component
function TrendAnalysisTab({ trendDistrict, setTrendDistrict, trendRiceType, setTrendRiceType, trendLoading, trendData, handleTrendAnalysis, riceTypes }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Historical Trend Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Analyze production trends over past seasons
        </p>

        <form onSubmit={handleTrendAnalysis} className="grid md:grid-cols-3 gap-4">
          <select
            value={trendDistrict}
            onChange={(e) => setTrendDistrict(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select district...</option>
            {['Ampara', 'Polonnaruwa', 'Hambantota', 'Anuradhapura', 'Kurunegala', 'Batticaloa', 'Trincomalee'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={trendRiceType}
            onChange={(e) => setTrendRiceType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select rice type...</option>
            {riceTypes.map((rt: any) => (
              <option key={rt.id} value={rt.name}>{rt.name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={trendLoading}
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {trendLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Analyze Trends
              </>
            )}
          </button>
        </form>
      </Card>

      {trendData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Production Trends</h3>
          <div className="space-y-3">
            {trendData.map((trend, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{trend.season}</p>
                  <p className="text-sm text-gray-600">{trend.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {trend.avg_production?.toLocaleString()} kg
                  </p>
                  <p className="text-sm text-gray-600">{trend.sample_count} records</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Optimization Component
function OptimizationTab({ optimizeDistrict, setOptimizeDistrict, optimizeRiceType, setOptimizeRiceType, optimizeLoading, optimizationResults, handleOptimization, riceTypes }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          Best Season Optimizer
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Find the optimal season to plant for maximum yield
        </p>

        <form onSubmit={handleOptimization} className="grid md:grid-cols-3 gap-4">
          <select
            value={optimizeDistrict}
            onChange={(e) => setOptimizeDistrict(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select district...</option>
            {['Ampara', 'Polonnaruwa', 'Hambantota', 'Anuradhapura', 'Kurunegala', 'Batticaloa', 'Trincomalee'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={optimizeRiceType}
            onChange={(e) => setOptimizeRiceType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select rice type...</option>
            {riceTypes.map((rt: any) => (
              <option key={rt.id} value={rt.name}>{rt.name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={optimizeLoading}
            className="bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {optimizeLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lightbulb className="w-5 h-5" />
                Find Best Season
              </>
            )}
          </button>
        </form>
      </Card>

      {optimizationResults && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
            <h3 className="text-lg font-semibold mb-4 text-green-900">🏆 Best Season</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Recommended Season</p>
                <p className="text-2xl font-bold text-green-600">{optimizationResults.best_season}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Yield</p>
                <p className="text-3xl font-bold text-green-600">
                  {optimizationResults.max_production?.toLocaleString()} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-xl font-semibold">{optimizationResults.confidence?.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">💡 Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ {optimizationResults.insight_1 || 'Based on 10+ years of historical data'}</li>
              <li>✓ {optimizationResults.insight_2 || 'Optimal weather conditions expected'}</li>
              <li>✓ {optimizationResults.insight_3 || 'High success rate in your district'}</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}