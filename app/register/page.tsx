'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    district: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    // Redirect if already authenticated
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/map');
      } else {
        router.push('/farmer/dashboard');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('/api/districts');
      const result = await response.json();
      if (result.success) {
        setDistricts(result.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.district) {
      setError('Please select a district');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'farmer',
        district: formData.district,
        phone: formData.phone || undefined,
      });
      
      // Show success toast
      setToastType('success');
      setToastMessage('Registration successful! Redirecting to login...');
      setShowToast(true);
      
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      // Show error toast
      setToastType('error');
      setToastMessage(err.message || 'Registration failed. Please try again.');
      setShowToast(true);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You will be redirected to the login page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={toastType === 'success' ? 2000 : 4000}
        />
      )}

      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-700">Farmer Registration</h2>
          <p className="text-gray-600 mt-2">Join Sri Lanka Lanka Rice Hub System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+94 XX XXX XXXX"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District <span className="text-red-500">*</span>
            </label>
            {loadingDistricts ? (
              <div className="flex items-center justify-center p-3 border border-gray-300 rounded-lg bg-gray-50">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Loading districts...</span>
              </div>
            ) : (
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select your district</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            error={error}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
