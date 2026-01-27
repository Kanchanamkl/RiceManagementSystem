'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { TrendingUp, Package, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';

interface Stats {
  total_productions: number;
  total_quantity: number;
  districts_count: number;
  rice_types_count: number;
}

interface Recommendation {
  rice_type: string;
  avg_production: number;
  sample_count: number;
  recommendation: string;
  max_production?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  district: string;
}
export default function FarmerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState('');
  const [user, setUser] = useState<User| null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.district) {
      console.log("user district",);
      fetchRecommendations(user?.district);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/productions/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      // if (data.success) {
        console.log('Fetched user:', data.data.user);
        setUser(data.data.user);
      // }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchRecommendations = async (district: string) => {
    setLoadingRecs(true);
    setRecsError('');
    
    try {
      console.log('Fetching recommendations for district:', district);
      
      const response = await fetch('/api/ml/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district })
      });

      const data = await response.json();
      console.log('Recommendations response:', data);

      if (data.success && data.data?.data?.recommendations) {
        setRecommendations(data.data.data.recommendations);
      } else if (data.success && data.data?.recommendations) {
        setRecommendations(data.data.recommendations);
      } else if (data.error) {
        setRecsError(data.error);
      } else {
        setRecsError('No recommendations found');
      }
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
      setRecsError('Unable to load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Farmer'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your rice production
        </p>
      </div>

      {/* Stats Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
          <p className="text-sm text-gray-600">Total Productions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.total || 0}
          </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
          <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.count || 0}
          </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
          <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
          <p className="text-sm text-gray-600">By Season</p>
          <div className="mt-1">
            <p className="text-sm text-gray-700">
              Maha: <span className="font-semibold">{stats?.bySeason?.['Maha 2024/25'] || 0}</span>
            </p>
            <p className="text-sm text-gray-700">
              Yala: <span className="font-semibold">{stats?.bySeason?.['Yala 2025'] || 0}</span>
            </p>
          </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
          <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ML Recommendations Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-green-600" />
              ML Recommendations for {user?.district || 'Your District'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Based on historical data analysis 
            </p>
          </div>
          <Link
            href="/farmer/predictions"
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All Predictions
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>

        {loadingRecs ? (
          <Card className="p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600 mb-3" />
            <p className="text-gray-600 font-medium">Analyzing historical data...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </Card>
        ) : recsError ? (
          <Card className="p-8 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">Unable to load recommendations</p>
                <p className="text-sm text-red-700 mt-1">{recsError}</p>
                <button
                  onClick={() => user?.district && fetchRecommendations(user.district)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Loader2 className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </Card>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                className={`p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  index === 0
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 ring-2 ring-green-200'
                    : index === 1
                    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      <h3 className="text-xl font-bold text-gray-900">
                        {rec.rice_type}
                      </h3>
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      index === 0
                        ? 'bg-green-600 text-white'
                        : index === 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      Top {index + 1} Performer
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white bg-opacity-70 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Average Yield</p>
                    <p className="text-2xl font-bold text-green-600">
                      {rec.avg_production.toLocaleString()} kg
                    </p>
                  </div>

                  {rec.max_production && (
                    <div className="bg-white bg-opacity-70 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Peak Production</p>
                      <p className="text-xl font-semibold text-blue-600">
                        {rec.max_production.toLocaleString()} kg
                      </p>
                    </div>
                  )}

                  <div className="bg-white bg-opacity-70 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Data Points</p>
                    <p className="text-lg font-medium text-gray-900">
                      {rec.sample_count} harvests analyzed
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      💡 {rec.recommendation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-slate-50">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">
                No recommendations available yet
              </p>
              <p className="text-sm text-gray-500">
                Add more production records to get AI-powered insights for your district
              </p>
              <Link
                href="/farmer/productions"
                className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Production Data
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/farmer/productions">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Productions</h3>
                <p className="text-sm text-gray-600">Add or edit records</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/farmer/predictions">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Predictions</h3>
                <p className="text-sm text-gray-600">Forecast future yields</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/farmer/area-stats">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Area Statistics</h3>
                <p className="text-sm text-gray-600">View regional data</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}