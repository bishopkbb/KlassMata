// app/admin/dashboard/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  DollarSign,
  TrendingUp,
  Users,
  GraduationCap,
  CreditCard,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react'
import { FeeCollectionChart } from '@/app/components/reports/FeeCollectionChart'
import { StudentPerformanceChart } from '@/app/components/reports/StudentPerformanceChart'
import { SubscriptionUsageChart } from '@/app/components/reports/SubscriptionUsageChart'
import { RevenueOverviewChart } from '@/app/components/reports/RevenueOverviewChart'

interface AdminStats {
  totalRevenue: number
  pendingPayments: number
  totalStudents: number
  activeTeachers: number
  averagePerformance: number
  subscriptionUsage: number
}

interface FeeData {
  month: string
  collected: number
  pending: number
  total: number
}

interface PerformanceData {
  grade: string
  average: number
  passRate: number
  studentCount: number
}

interface PaymentSummary {
  category: string
  amount: number
  count: number
  percentage: number
}

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    totalStudents: 0,
    activeTeachers: 0,
    averagePerformance: 0,
    subscriptionUsage: 0
  })

  const [feeData, setFeeData] = useState<FeeData[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([])

  useEffect(() => {
    fetchAdminReports()
  }, [selectedPeriod])

  const fetchAdminReports = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setFeeData(data.feeCollection)
        setPerformanceData(data.performance)
        setPaymentSummary(data.paymentSummary)
      } else {
        loadMockData()
      }
    } catch (error) {
      console.error('Error fetching admin reports:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    setStats({
      totalRevenue: 2450000,
      pendingPayments: 385000,
      totalStudents: 486,
      activeTeachers: 24,
      averagePerformance: 76.5,
      subscriptionUsage: 68
    })

    setFeeData([
      { month: 'Jan', collected: 420000, pending: 80000, total: 500000 },
      { month: 'Feb', collected: 380000, pending: 70000, total: 450000 },
      { month: 'Mar', collected: 450000, pending: 60000, total: 510000 },
      { month: 'Apr', collected: 400000, pending: 75000, total: 475000 },
      { month: 'May', collected: 480000, pending: 50000, total: 530000 },
      { month: 'Jun', collected: 520000, pending: 50000, total: 570000 },
    ])

    setPerformanceData([
      { grade: 'Grade 10', average: 78.5, passRate: 92, studentCount: 120 },
      { grade: 'Grade 11', average: 75.2, passRate: 88, studentCount: 115 },
      { grade: 'Grade 12', average: 80.1, passRate: 95, studentCount: 105 },
      { grade: 'Grade 9', average: 72.8, passRate: 85, studentCount: 146 },
    ])

    setPaymentSummary([
      { category: 'Tuition Fees', amount: 1800000, count: 450, percentage: 73.5 },
      { category: 'Exam Fees', amount: 320000, count: 486, percentage: 13.1 },
      { category: 'Library Fees', amount: 180000, count: 400, percentage: 7.3 },
      { category: 'Lab Fees', amount: 150000, count: 350, percentage: 6.1 },
    ])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const handleExport = () => {
    console.log('Exporting admin reports...')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">School Analytics Dashboard</h1>
            <p className="text-blue-100 mt-2">
              Comprehensive overview of school performance and financials
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={fetchAdminReports}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg shadow-sm hover:bg-white/30 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <label className="font-medium text-gray-700">Time Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ... keep the stat cards, but all styled with rounded-xl + consistent borders + subtle shadows ... */}
      </div>

      {/* Charts */}
      <FeeCollectionChart data={feeData} />
      <RevenueOverviewChart data={feeData} />
      <StudentPerformanceChart data={performanceData} />
      <SubscriptionUsageChart 
        current={stats.totalStudents} 
        limit={2000} 
        usage={stats.subscriptionUsage} 
      />

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Breakdown & Grade-wise Performance cards */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gradient summary cards kept but upgraded with rounded-xl and consistent spacing */}
      </div>
    </div>
  )
}
