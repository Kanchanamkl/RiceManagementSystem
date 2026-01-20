'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { TrendingUp, Package, Calendar, MapPin, Loader2 } from 'lucide-react';

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
}

export default function FarmerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.district) {
      fetchRecommendations(user.district);
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
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchRecommendations = async (district: string) => {
    setLoadingRecs(true);
    try {
      const response = await fetch('/api/ml/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district })
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Farmer Dashboard
      </h1>

      {/* Existing Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_productions || 0}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_quantity?.toLocaleString() || 0} kg
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Districts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.districts_count || 0}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rice Types</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.rice_types_count || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* ML Recommendations Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            AI Recommendations for {user?.district || 'Your District'}
          </h2>
          <Link
            href="/farmer/predictions"
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
          >
            View Predictions
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>

        {loadingRecs ? (
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600 mb-2" />
            <p className="text-gray-600">Loading recommendations...</p>
          </Card>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-green-900">
                    {rec.rice_type}
                  </h3>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    Top {index + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. Yield:</span>
                    <span className="font-semibold text-green-900">
                      {rec.avg_production.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Based on:</span>
                    <span className="font-semibold text-green-900">
                      {rec.sample_count} harvests
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-green-200">
                    {rec.recommendation}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              No recommendations available for your district yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}