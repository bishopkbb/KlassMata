// app/onboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setError('No invite code provided');
      setLoading(false);
      return;
    }

    // Validate invite code
    fetch(`/api/teachers/onboard?code=${inviteCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setInviteData(data.invite);
        } else {
          setError(data.error || 'Invalid invite code');
        }
      })
      .catch(() => setError('Failed to validate invite'))
      .finally(() => setLoading(false));
  }, [inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/teachers/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Account created successfully! Please log in.');
        router.push('/auth/login');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invite</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#024731] mb-2">Welcome to KlassMata!</h1>
        <p className="text-gray-600 mb-6">
          You've been invited to join <strong>{inviteData?.schoolName}</strong> as a teacher.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-semibold">{inviteData?.email}</p>
          <p className="text-sm text-gray-600 mt-2">Name</p>
          <p className="font-semibold">{inviteData?.firstName} {inviteData?.lastName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Create Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min 8 characters"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#024731]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#024731]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-4 py-2 bg-[#024731] text-white rounded hover:bg-[#035a3d] disabled:bg-gray-300 transition"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}