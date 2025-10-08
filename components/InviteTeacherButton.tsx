// components/InviteTeacherButton.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function InviteTeacherButton() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/teachers/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('You need to be logged in to invite teachers');
          return;
        }
        
        if (response.status === 403) {
          setError('You do not have permission to invite teachers');
          return;
        }

        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess(`Teacher invited successfully! Invite code: ${data.inviteCode}`);
      setInviteCode(data.inviteCode);
      
      // Reset form
      setFormData({ name: '', email: '', subject: '' });
      
      // Close modal after 5 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSuccess('');
        setInviteCode('');
      }, 5000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Invite code copied to clipboard!');
  };

  // Check if user is authorized
  const canInvite = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';

  if (status === 'loading') {
    return <button className="px-4 py-2 bg-gray-300 rounded" disabled>Loading...</button>;
  }

  if (!session) {
    return (
      <button 
        className="px-4 py-2 bg-gray-300 rounded cursor-not-allowed" 
        disabled
        title="Please log in"
      >
        Invite Teacher
      </button>
    );
  }

  if (!canInvite) {
    return (
      <button 
        className="px-4 py-2 bg-gray-300 rounded cursor-not-allowed" 
        disabled
        title="Only admins can invite teachers"
      >
        Invite Teacher
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-[#024731] text-white rounded hover:bg-[#035a3d] transition"
      >
        + Invite Teacher
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#024731]">Invite Teacher</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                  setSuccess('');
                  setInviteCode('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <p>{success}</p>
                {inviteCode && (
                  <button
                    onClick={copyInviteCode}
                    className="mt-2 text-sm underline"
                  >
                    Copy invite code
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#024731]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="teacher@school.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#024731]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#024731]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#024731] text-white rounded hover:bg-[#035a3d] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}