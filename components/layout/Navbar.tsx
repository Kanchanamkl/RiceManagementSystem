'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut, Home, Package, BarChart3, Map, Database, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    { href: '/admin/stocks', label: 'Stocks', icon: Database },
    { href: '/admin/demands', label: 'Demands', icon: ClipboardList } // ⭐ NEW
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
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user?.role === 'admin' ? '/admin/map' : '/farmer/dashboard'}>
              <div className="flex items-center cursor-pointer">
                <Package className="w-8 h-8 mr-2" />
                <span className="text-xl font-bold">Rice Management</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {link.label}
                </Link>
              );
            })}
            
            {/* User Info & Logout */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-green-500">
              <div className="text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-green-200 text-xs capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-green-700 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-green-500">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
            
            <div className="border-t border-green-500 mt-2 pt-2">
              <div className="px-3 py-2 text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-green-200 text-xs capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 transition"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}