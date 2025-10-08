// app/teacher/assignments/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Download,
  Eye,
  Save
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface AssignmentDetail {
  id: string
  title: string
  description: string
  className: string
  subjectName: string
  dueDate: string
  maxPoints: number
  isActive: boolean
  createdAt: string
  totalStudents: number
  submissions: Submission[]
}

interface Submission {
  id: string
  studentId: string
  studentName: string
  studentNumber: string
  content: string
  attachments: string[]
  submittedAt: string
  points: number | null
  feedback: string
  gradedAt: string | null
  isLate: boolean
}

export default function AssignmentDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'submissions'>('details')
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null)
  const [gradeData, setGradeData] = useState<{ points: number; feedback: string }>({
    points: 0,
    feedback: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      fetchAssignmentDetail()
    }
  }, [id])

  const fetchAssignmentDetail = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/teacher/assignments/${id}`)
      
      if (res.status === 401) {
        toast.error('Please log in')
        router.push('/auth/login')
        return
      }

      if (res.status === 404) {
        toast.error('Assignment not found')
        router.push('/teacher/assignments')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setAssignment(data.assignment)
      } else {
        toast.error('Failed to load assignment')
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
      toast.error('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const deleteAssignment = async () => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/teacher/assignments/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Assignment deleted successfully')
        router.push('/teacher/assignments')
      } else {
        toast.error('Failed to delete assignment')
      }
    } catch (error) {
      toast.error('Failed to delete assignment')
    }
  }

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission.id)
    setGradeData({
      points: submission.points || 0,
      feedback: submission.feedback || '',
    })
  }

  const saveGrade = async (submissionId: string) => {
    try {
      setSaving(true)
      const res = await fetch(`/api/teacher/assignments/${id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          points: gradeData.points,
          feedback: gradeData.feedback,
        }),
      })

      if (res.ok) {
        toast.success('Grade saved successfully')
        setGradingSubmission(null)
        fetchAssignmentDetail()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save grade')
      }
    } catch (error) {
      toast.error('Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  const getSubmissionStats = () => {
    if (!assignment) return { submitted: 0, graded: 0, pending: 0, rate: 0 }
    
    const submitted = assignment.submissions.length
    const graded = assignment.submissions.filter(s => s.points !== null).length
    const pending = submitted - graded
    const rate = assignment.totalStudents > 0 
      ? Math.round((submitted / assignment.totalStudents) * 100)
      : 0

    return { submitted, graded, pending, rate }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Assignment not found</p>
        </div>
      </div>
    )
  }

  const stats = getSubmissionStats()
  const isOverdue = new Date(assignment.dueDate) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/teacher/assignments"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                {isOverdue ? (
                  <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                    Overdue
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {assignment.className}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {assignment.subjectName}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  {assignment.maxPoints} points
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => router.push(`/teacher/assignments/${id}/edit`)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={deleteAssignment}
                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.submitted}/{assignment.totalStudents}</p>
            <p className="text-sm text-gray-600">Submissions ({stats.rate}%)</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
            <p className="text-sm text-gray-600">Graded</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {assignment.totalStudents - stats.submitted}
            </p>
            <p className="text-sm text-gray-600">Not Submitted</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Assignment Details
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'submissions'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Submissions ({assignment.submissions.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' ? (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {assignment.submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignment.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-emerald-700 font-semibold">
                                {submission.studentName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {submission.studentName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                ID: {submission.studentNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {submission.isLate && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Late
                              </span>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                        </div>

                        {gradingSubmission === submission.id ? (
                          <div className="border-t border-gray-200 pt-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Points (Max: {assignment.maxPoints})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={assignment.maxPoints}
                                step="0.1"
                                value={gradeData.points}
                                onChange={(e) => setGradeData({ ...gradeData, points: parseFloat(e.target.value) })}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback
                              </label>
                              <textarea
                                rows={4}
                                value={gradeData.feedback}
                                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                placeholder="Provide feedback to the student..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveGrade(submission.id)}
                                disabled={saving}
                                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Grade'}
                              </button>
                              <button
                                onClick={() => setGradingSubmission(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                {submission.points !== null ? (
                                  <div>
                                    <p className="text-lg font-bold text-gray-900">
                                      {submission.points}/{assignment.maxPoints} points
                                      <span className="text-sm text-gray-600 ml-2">
                                        ({Math.round((submission.points / assignment.maxPoints) * 100)}%)
                                      </span>
                                    </p>
                                    {submission.feedback && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        Feedback: {submission.feedback}
                                      </p>
                                    )}
                                    {submission.gradedAt && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Graded: {new Date(submission.gradedAt).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-600">Not graded yet</p>
                                )}
                              </div>
                              <button
                                onClick={() => startGrading(submission)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                {submission.points !== null ? 'Edit Grade' : 'Grade'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}