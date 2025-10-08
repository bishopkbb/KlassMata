// app/admin/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ReportData {
  attendance: {
    overall: number
    trend: 'up' | 'down'
    byClass: { className: string; percentage: number }[]
  }
  academic: {
    averageGrade: number
    trend: 'up' | 'down'
    topPerformers: { name: string; average: number }[]
  }
  financial: {
    totalRevenue: number
    outstandingFees: number
    collectionRate: number
  }
  enrollment: {
    total: number
    newThisMonth: number
    byGrade: { grade: string; count: number }[]
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState('overview')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/reports?period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      }
    } catch (error) {
      toast.error('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (type: string) => {
    try {
      const res = await fetch(`/api/reports/export?type=${type}&period=${selectedPeriod}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        toast.success('Report exported successfully!')
      }
    } catch (error) {
      toast.error('Failed to export report')
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
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">View school performance metrics and insights</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="term">This Term</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={() => exportReport(selectedReport)}
                className="flex items-center px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'academic', label: 'Academic' },
              { id: 'financial', label: 'Financial' },
              { id: 'enrollment', label: 'Enrollment' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedReport === tab.id
                    ? 'text-emerald-900 border-b-2 border-emerald-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading report data...</p>
          </div>
        ) : !reportData ? (
          <div className="p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No report data available</p>
          </div>
        ) : (
          <>
            {/* Overview Report */}
            {selectedReport === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      {reportData.attendance.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {reportData.attendance.overall}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.attendance.trend === 'up' ? '+' : '-'}2% from last period
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Average Grade</p>
                      {reportData.academic.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {reportData.academic.averageGrade}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.academic.trend === 'up' ? '+' : '-'}3% from last period
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ₦{(reportData.financial.totalRevenue / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportData.financial.collectionRate}% collection rate
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">New Students</p>
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {reportData.enrollment.newThisMonth}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {reportData.enrollment.total}
                    </p>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Attendance by Class */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Attendance by Class
                    </h3>
                    <div className="space-y-3">
                      {reportData.attendance.byClass.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{item.className}</span>
                            <span className="font-medium text-gray-900">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Performers
                    </h3>
                    <div className="space-y-3">
                      {reportData.academic.topPerformers.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-purple-700 font-semibold text-sm">
                                #{index + 1}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-700">{student.average}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enrollment by Grade */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Enrollment Distribution
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reportData.enrollment.byGrade.map((item, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                        <p className="text-sm text-gray-600 mt-1">Grade {item.grade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Report */}
            {selectedReport === 'attendance' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Analysis</h3>
                <div className="space-y-6">
                  {reportData.attendance.byClass.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{item.className}</span>
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            item.percentage >= 90 ? 'bg-green-600' :
                            item.percentage >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Report */}
            {selectedReport === 'academic' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h3>
                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-gray-900">{reportData.academic.averageGrade}%</p>
                  <p className="text-gray-600 mt-2">Overall Average Grade</p>
                </div>
                <div className="space-y-4">
                  {reportData.academic.topPerformers.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <GraduationCap className="w-6 h-6 text-purple-600 mr-3" />
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-700">{student.average}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Report */}
            {selectedReport === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      ₦{reportData.financial.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-2">Outstanding Fees</p>
                    <p className="text-3xl font-bold text-red-600">
                      ₦{reportData.financial.outstandingFees.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-2">Collection Rate</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {reportData.financial.collectionRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enrollment Report */}
            {selectedReport === 'enrollment' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Enrollment Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {reportData.enrollment.byGrade.map((item, index) => (
                    <div key={index} className="text-center p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-emerald-700" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{item.count}</p>
                      <p className="text-sm text-gray-600">Grade {item.grade}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}