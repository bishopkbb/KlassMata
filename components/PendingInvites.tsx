// components/PendingInvites.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Invite {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  code: string;
  subject?: string;
  expiresAt: string;
  createdAt: string;
}

export default function PendingInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/teachers/invite');
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelInvite = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invite?')) return;

    try {
      const res = await fetch(`/api/teachers/invite/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setInvites(prev => prev.filter(inv => inv.id !== id));
        toast.success('Invite cancelled successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to cancel invite');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const copyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/onboard?code=${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    toast.success('Invite link copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (invites.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-[#024731]" />
        Pending Invites ({invites.length})
      </h3>
      
      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">
                  {invite.firstName} {invite.lastName}
                </p>
                {invite.subject && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {invite.subject}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{invite.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-gray-500">
                  {getTimeRemaining(invite.expiresAt)}
                </p>
                <p className="text-xs text-gray-400">
                  Sent {new Date(invite.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCode(invite.code)}
                className="px-3 py-2 text-sm bg-[#024731] text-white rounded hover:bg-[#035a3d] transition flex items-center gap-2"
                title="Copy invite link"
              >
                {copiedCode === invite.code ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>

              <button
                onClick={() => cancelInvite(invite.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                title="Cancel invite"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}