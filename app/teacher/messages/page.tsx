// app/teacher/messages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Send,
  Inbox,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Message {
  id: string
  title: string
  content: string
  sender: {
    name: string
    role: string
  }
  sentAt: string
  isRead: boolean
  priority: 'normal' | 'high' | 'urgent'
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [sending, setSending] = useState(false)
  
  const [composeData, setComposeData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
  })

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/teacher/messages')
      
      if (res.status === 401) {
        toast.error('Please log in')
        router.push('/auth/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      } else {
        toast.error('Failed to load messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const res = await fetch(`/api/teacher/messages/${messageId}/read`, {
        method: 'POST',
      })

      if (res.ok) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      markAsRead(message.id)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!composeData.title.trim() || !composeData.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setSending(true)
      const res = await fetch('/api/teacher/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData),
      })

      if (res.ok) {
        toast.success('Message sent successfully')
        setShowCompose(false)
        setComposeData({ title: '', content: '', priority: 'normal' })
        fetchMessages()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                  </span>
                )}
                {unreadCount === 0 && 'All caught up!'}
              </p>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              New Message
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center">
                  <Inbox className="w-5 h-5 mr-2" />
                  Inbox
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      } ${!message.isRead ? 'bg-emerald-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-medium ${!message.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                          {message.title}
                        </h3>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{message.sender.name}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedMessage.title}
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {selectedMessage.sender.name} ({selectedMessage.sender.role})
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(selectedMessage.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={composeData.title}
                  onChange={(e) => setComposeData({ ...composeData, title: e.target.value })}
                  placeholder="Message subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={composeData.priority}
                  onChange={(e) => setComposeData({ ...composeData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  rows={8}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}