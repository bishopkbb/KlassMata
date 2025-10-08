// app/teacher/assignments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText,
  Plus,
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Assignment {
  id: string
  title: string
  description: string
  className: string
  subjectName: string
  dueDate: string
  maxPoints: number
  submissions: number
  totalStudents: number
  isActive: boolean
  createdAt: string
}

export default function AssignmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'past'>('all')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/teacher/assignments')
      
      if (res.status === 401) {
        toast.error('Please log in')
        router.push('/auth/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
      } else {
        toast.error('Failed to fetch assignments')
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to fetch assignments')
    } finally {
      setLoading(false)
    }
  }

  const deleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const res = await fetch(`/api/teacher/assignments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAssignments(prev => prev.filter(a => a.id !== id))
        toast.success('Assignment deleted successfully')
      } else {
        toast.error('Failed to delete assignment')
      }
    } catch (error) {
      toast.error('Failed to delete assignment')
    }
  }

  const getFilteredAssignments = () => {
    let filtered = assignments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    const now = new Date()
    if (filterStatus === 'active') {
      filtered = filtered.filter(a => new Date(a.dueDate) >= now && a.isActive)
    } else if (filterStatus === 'past') {
      filtered = filtered.filter(a => new Date(a.dueDate) < now)
    }

    return filtered
  }

  const filteredAssignments = getFilteredAssignments()

  const getSubmissionRate = (assignment: Assignment) => {
    if (assignment.totalStudents === 0) return 0
    return Math.round((assignment.submissions / assignment.totalStudents) * 100)
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diff = due.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600 mt-1">Create and manage assignments</p>
            </div>
            <button
              onClick={() => router.push('/teacher/assignments/new')}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({assignments.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('past')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'past'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Past
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No assignments found' : 'No assignments yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first assignment to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/teacher/assignments/new')}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const submissionRate = getSubmissionRate(assignment)
              const overdue = isOverdue(assignment.dueDate)
              
              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {assignment.title}
                          </h3>
                          {overdue ? (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              Overdue
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {assignment.className}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {assignment.subjectName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {getDaysUntilDue(assignment.dueDate)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/teacher/assignments/${assignment.id}/edit`)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Submission Progress */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Submissions: {assignment.submissions} / {assignment.totalStudents}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {submissionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            submissionRate === 100
                              ? 'bg-green-500'
                              : submissionRate >= 50
                              ? 'bg-blue-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${submissionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}