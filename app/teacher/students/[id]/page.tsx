'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  FileText
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface StudentDetail {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  className: string
  admissionDate: string
  parentName: string
  parentEmail: string
  parentPhone: string
  stats: {
    attendanceRate: number
    averageGrade: number
    totalAssignments: number
    submittedAssignments: number
    presentDays: number
    absentDays: number
  }
  recentGrades: {
    assignmentTitle: string
    subjectName: string
    points: number
    maxPoints: number
    date: string
  }[]
  recentAttendance: {
    date: string
    status: string
    subjectName: string
  }[]
}

export default function StudentDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentDetail()
  }, [id])

  const fetchStudentDetail = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/teacher/students/${id}`)
      
      if (res.status === 401) {
        toast.error('Please log in')
        router.push('/auth/login')
        return
      }

      if (res.status === 404) {
        toast.error('Student not found')
        router.push('/teacher/students')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setStudent(data.student)
      } else {
        toast.error('Failed to load student details')
      }
    } catch (error) {
      console.error('Error fetching student:', error)
      toast.error('Failed to load student details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'excused':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradePercentage = (points: number, maxPoints: number) => {
    return Math.round((points / maxPoints) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Student not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/teacher/students"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-emerald-700">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-gray-600 mt-1">Student ID: {student.studentId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {student.gender}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.address || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BookOpen className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.className}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Admission Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(student.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.parentName || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.parentEmail || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {student.parentPhone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Performance Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {student.stats.averageGrade}%
                </p>
                <p className="text-sm text-gray-600">Average Grade</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {student.stats.attendanceRate}%
                </p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {student.stats.submittedAssignments}/{student.stats.totalAssignments}
                </p>
                <p className="text-sm text-gray-600">Submissions</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  {student.stats.presentDays > student.stats.absentDays ? (
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {student.stats.presentDays}
                </p>
                <p className="text-sm text-gray-600">Days Present</p>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Grades</h2>
              </div>
              <div className="p-6">
                {student.recentGrades.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No grades yet</p>
                ) : (
                  <div className="space-y-3">
                    {student.recentGrades.map((grade, index) => {
                      const percentage = getGradePercentage(grade.points, grade.maxPoints)
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {grade.assignmentTitle}
                            </h3>
                            <p className="text-sm text-gray-600">{grade.subjectName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(grade.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {grade.points}/{grade.maxPoints}
                            </p>
                            <p className={`text-sm font-medium ${
                              percentage >= 70
                                ? 'text-green-600'
                                : percentage >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
              </div>
              <div className="p-6">
                {student.recentAttendance.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No attendance records</p>
                ) : (
                  <div className="space-y-3">
                    {student.recentAttendance.map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{record.subjectName}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}