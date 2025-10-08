// app/admin/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'  
import Link from 'next/link'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Download,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Payment {
  id: string
  studentName: string
  studentId: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
  reference: string
  description: string
  paidAt?: string
  createdAt: string
}

export default function PaymentsPage() {
  const router = useRouter()
  
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    description: '',
  })

  useEffect(() => {
    fetchPayments()
    fetchStudents()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/payments')
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (error) {
      toast.error('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Failed to fetch students')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Payment initiated successfully!')
        setShowCreateModal(false)
        setFormData({ studentId: '', amount: '', description: '' })
        
        // Redirect to payment gateway if needed
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank')
        }
        
        fetchPayments()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to initiate payment')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const exportPayments = () => {
    const headers = ['Reference', 'Student', 'Amount', 'Status', 'Method', 'Date']
    const rows = filteredPayments.map(p => [
      p.reference,
      p.studentName,
      `₦${p.amount.toLocaleString()}`,
      p.status,
      p.paymentMethod,
      new Date(p.paidAt || p.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Payments exported successfully!')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0),
    pending: payments.filter(p => p.status === 'pending').length,
    completed: payments.filter(p => p.status === 'completed').length,
    failed: payments.filter(p => p.status === 'failed').length,
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
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-1">Manage student fees and payments</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportPayments}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Payment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">₦{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completed</p>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending</p>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Failed</p>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.failed}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name, ID, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Payment History ({filteredPayments.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {payment.reference}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.studentName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.studentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          ₦{payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Initiate Payment</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} - {student.studentId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder="50000"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="School fees - Term 1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ studentId: '', amount: '', description: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  Initiate Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}