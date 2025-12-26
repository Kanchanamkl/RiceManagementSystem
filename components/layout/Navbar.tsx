'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut, Home, Package, BarChart3, Map, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const farmerLinks = [
    { href: '/farmer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/farmer/productions', label: 'Productions', icon: Package },
    { href: '/farmer/area-stats', label: 'Area Stats', icon: BarChart3 }
  ];

  const adminLinks = [
    { href: '/admin/map', label: 'Map View', icon: Map },
    { href: '/admin/stocks', label: 'Stocks', icon: Database }
  ];

  const links = user?.role === 'admin' ? adminLinks : farmerLinks;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Rice Management System</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {links.map(link => (
              <a 
                key={link.href} 
                href={link.href} 
                className="flex items-center px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </a>
            ))}
            <button 
              onClick={handleLogout} 
              className="flex items-center px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-green-700 px-2 pt-2 pb-3 space-y-1">
          {links.map(link => (
            <a 
              key={link.href} 
              href={link.href} 
              className="flex items-center px-3 py-2 rounded-md hover:bg-green-800"
            >
              <link.icon className="w-4 h-4 mr-2" />
              {link.label}
            </a>
          ))}
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center px-3 py-2 rounded-md hover:bg-green-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}