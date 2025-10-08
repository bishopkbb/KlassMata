// app/admin/assignments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Assignment {
  id: string
  title: string
  description: string
  className: string
  subject: string
  dueDate: string
  maxPoints: number
  submissions: number
  totalStudents: number
  isActive: boolean
  createdAt: string
}

export default function AssignmentsPage() {
  const router = useRouter()
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '',
    maxPoints: '100',
  })

  useEffect(() => {
    fetchAssignments()
    fetchClasses()
    fetchSubjects()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/assignments')
      if (res.ok) {
        const data = await res.json()
        setAssignments(data)
      }
    } catch (error) {
      toast.error('Failed to fetch assignments')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Failed to fetch classes')
    }
  }

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch subjects')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingAssignment ? 'PUT' : 'POST'
      const url = editingAssignment 
        ? `/api/assignments/${editingAssignment.id}` 
        : '/api/assignments'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxPoints: parseFloat(formData.maxPoints)
        }),
      })

      if (res.ok) {
        toast.success(editingAssignment ? 'Assignment updated!' : 'Assignment created!')
        setShowAddModal(false)
        setEditingAssignment(null)
        setFormData({ title: '', description: '', classId: '', subjectId: '', dueDate: '', maxPoints: '100' })
        fetchAssignments()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save assignment')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        setAssignments(prev => prev.filter(a => a.id !== id))
        toast.success('Assignment deleted successfully!')
      } else {
        toast.error('Failed to delete assignment')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description,
      classId: '', // You'll need to store this
      subjectId: '', // You'll need to store this
      dueDate: assignment.dueDate.split('T')[0],
      maxPoints: assignment.maxPoints.toString(),
    })
    setShowAddModal(true)
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getSubmissionRate = (assignment: Assignment) => {
    if (assignment.totalStudents === 0) return 0
    return Math.round((assignment.submissions / assignment.totalStudents) * 100)
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && assignment.isActive && !isOverdue(assignment.dueDate)) ||
      (filterStatus === 'overdue' && isOverdue(assignment.dueDate)) ||
      (filterStatus === 'completed' && getSubmissionRate(assignment) === 100)

    return matchesSearch && matchesStatus
  })

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
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600 mt-1">Create and manage assignments</p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true)
                setEditingAssignment(null)
                setFormData({ title: '', description: '', classId: '', subjectId: '', dueDate: '', maxPoints: '100' })
              }}
              className="flex items-center px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Assignment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total</p>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active</p>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {assignments.filter(a => a.isActive && !isOverdue(a.dueDate)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Overdue</p>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {assignments.filter(a => isOverdue(a.dueDate)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg. Submission</p>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {assignments.length > 0
                ? Math.round(assignments.reduce((sum, a) => sum + getSubmissionRate(a), 0) / assignments.length)
                : 0
              }%
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
            >
              <option value="all">All Assignments</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {assignment.title}
                        </h3>
                        {isOverdue(assignment.dueDate) && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Overdue
                          </span>
                        )}
                        {!isOverdue(assignment.dueDate) && assignment.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {assignment.className}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {assignment.subject}
                        </span>
                        <span className="text-gray-500">
                          Max Points: {assignment.maxPoints}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/admin/assignments/${assignment.id}`)}
                        className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Submission Progress */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Submissions</span>
                      <span className="text-sm font-medium text-gray-900">
                        {assignment.submissions} / {assignment.totalStudents} ({getSubmissionRate(assignment)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          getSubmissionRate(assignment) === 100
                            ? 'bg-green-600'
                            : getSubmissionRate(assignment) >= 70
                            ? 'bg-blue-600'
                            : getSubmissionRate(assignment) >= 40
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${getSubmissionRate(assignment)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics Chapter 5 Exercise"
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
                  rows={4}
                  placeholder="Provide detailed instructions for the assignment..."
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Points *
                  </label>
                  <input
                    type="number"
                    name="maxPoints"
                    value={formData.maxPoints}
                    onChange={handleChange}
                    min="1"
                    step="0.5"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingAssignment(null)
                    setFormData({ title: '', description: '', classId: '', subjectId: '', dueDate: '', maxPoints: '100' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}