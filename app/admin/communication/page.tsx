// app/admin/communication/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, 
  Send,
  ArrowLeft,
  Mail,
  Phone,
  Users,
  Bell,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Announcement {
  id: string
  title: string
  message: string
  audience: string
  status: 'sent' | 'scheduled' | 'draft'
  recipientCount: number
  sentAt?: string
  createdAt: string
}

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('announcements')
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
    sendVia: [] as string[],
    scheduleDate: '',
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/communications')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      toast.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sendVia: prev.sendVia.includes(value)
        ? prev.sendVia.filter(v => v !== value)
        : [...prev.sendVia, value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.sendVia.length === 0) {
      toast.error('Please select at least one communication channel')
      return
    }

    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Announcement sent successfully!')
        setShowCreateModal(false)
        setFormData({
          title: '',
          message: '',
          audience: 'all',
          sendVia: [],
          scheduleDate: '',
        })
        fetchAnnouncements()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to send announcement')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'draft':
        return <Bell className="w-5 h-5 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all':
        return 'All Users'
      case 'teachers':
        return 'Teachers Only'
      case 'parents':
        return 'Parents Only'
      case 'students':
        return 'Students Only'
      default:
        return audience
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
              <p className="text-gray-600 mt-1">Send announcements and messages</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Send className="w-5 h-5 mr-2" />
              New Announcement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Sent</p>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {announcements.filter(a => a.status === 'sent').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Scheduled</p>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {announcements.filter(a => a.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Drafts</p>
              <Bell className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {announcements.filter(a => a.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Reach</p>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {announcements.reduce((sum, a) => sum + a.recipientCount, 0)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'announcements', label: 'Announcements' },
              { id: 'sms', label: 'SMS' },
              { id: 'email', label: 'Email' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-900 border-b-2 border-emerald-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(announcement.status)}`}>
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{announcement.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {getAudienceLabel(announcement.audience)}
                      </span>
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {announcement.recipientCount} recipients
                      </span>
                      {announcement.sentAt && (
                        <span>
                          Sent: {new Date(announcement.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusIcon(announcement.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">New Announcement</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Parent-Teacher Meeting"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Write your announcement message..."
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience *
                </label>
                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="teachers">Teachers Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Send Via *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sendVia.includes('in-app')}
                      onChange={() => handleCheckboxChange('in-app')}
                      className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                    />
                    <Bell className="w-4 h-4 ml-3 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">In-App Notification</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sendVia.includes('email')}
                      onChange={() => handleCheckboxChange('email')}
                      className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                    />
                    <Mail className="w-4 h-4 ml-3 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sendVia.includes('sms')}
                      onChange={() => handleCheckboxChange('sms')}
                      className="w-4 h-4 text-emerald-900 border-gray-300 rounded focus:ring-emerald-900"
                    />
                    <Phone className="w-4 h-4 ml-3 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      title: '',
                      message: '',
                      audience: 'all',
                      sendVia: [],
                      scheduleDate: '',
                    })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  {formData.scheduleDate ? 'Schedule' : 'Send Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}