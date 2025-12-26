'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { District } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface DistrictStat extends District {
  production: number;
  demand: number;
  balance: number;
  status: 'surplus' | 'deficit' | 'balanced';
}

interface RiceMapProps {
  districts: DistrictStat[];
}

export function RiceMap({ districts }: RiceMapProps) {
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'surplus': return '#16a34a';
      case 'deficit': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getMarkerRadius = (production: number) => {
    return Math.max(10, Math.min(30, production / 500));
  };

  return (
    <div className="h-[500px] rounded-lg overflow-hidden">
      <MapContainer 
        center={[7.8731, 80.7718]} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {districts.map(district => (
          <CircleMarker
            key={district.id}
            center={[district.latitude, district.longitude]}
            radius={getMarkerRadius(district.production)}
            fillColor={getMarkerColor(district.status)}
            color="#fff"
            weight={2}
            opacity={1}
            fillOpacity={0.7}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{district.name}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Production:</strong> {formatNumber(district.production)} kg</p>
                  <p><strong>Demand:</strong> {formatNumber(district.demand)} kg</p>
                  <p>
                    <strong>Balance:</strong>{' '}
                    <span className={`font-semibold ${
                      district.status === 'surplus' ? 'text-green-600' :
                      district.status === 'deficit' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {district.balance > 0 ? '+' : ''}{formatNumber(district.balance)} kg
                    </span>
                  </p>
                  <p><strong>Status:</strong> <span className="font-semibold capitalize">{district.status}</span></p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}