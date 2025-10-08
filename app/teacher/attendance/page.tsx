// app/teacher/attendance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Download
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Class {
  id: string
  name: string
  studentCount: number
}

interface Student {
  id: string
  name: string
  studentId: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
}

interface Subject {
  id: string
  name: string
  code: string
}

export default function AttendancePage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass)
    } else {
      setSubjects([])
      setSelectedSubject('')
    }
  }, [selectedClass])

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedDate) {
      fetchStudents()
    }
  }, [selectedClass, selectedSubject, selectedDate])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/teacher/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to load classes')
    }
  }

  const fetchSubjects = async (classId: string) => {
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/subjects`)
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to load subjects')
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/teacher/attendance?classId=${selectedClass}&subjectId=${selectedSubject}&date=${selectedDate}`
      )
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
        setHasUnsavedChanges(false)
      } else {
        toast.error('Failed to load students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const updateStudentStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, status } : student
      )
    )
    setHasUnsavedChanges(true)
  }

  const markAllPresent = () => {
    setStudents(prev =>
      prev.map(student => ({ ...student, status: 'present' as const }))
    )
    setHasUnsavedChanges(true)
    toast.success('All students marked present')
  }

  const saveAttendance = async () => {
    if (!selectedClass || !selectedSubject || !selectedDate) {
      toast.error('Please select class, subject, and date')
      return
    }

    const attendanceRecords = students.map(student => ({
      studentId: student.id,
      status: student.status || 'absent',
    }))

    try {
      setSaving(true)
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          subjectId: selectedSubject,
          date: selectedDate,
          records: attendanceRecords,
        }),
      })

      if (res.ok) {
        toast.success('Attendance saved successfully!')
        setHasUnsavedChanges(false)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save attendance')
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const getStatusCounts = () => {
    const present = students.filter(s => s.status === 'present').length
    const absent = students.filter(s => s.status === 'absent').length
    const late = students.filter(s => s.status === 'late').length
    const excused = students.filter(s => s.status === 'excused').length
    const unmarked = students.filter(s => !s.status).length

    return { present, absent, late, excused, unmarked }
  }

  const statusCounts = getStatusCounts()

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
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Selection Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setStudents([])
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount} students)
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setStudents([])
                }}
                disabled={!selectedClass}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setStudents([])
                }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.present}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.absent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.late}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Excused</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.excused}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unmarked</p>
                  <p className="text-2xl font-bold text-gray-600">{statusCounts.unmarked}</p>
                </div>
                <Users className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Student List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students to Display</h3>
            <p className="text-gray-600">
              {!selectedClass || !selectedSubject || !selectedDate
                ? 'Please select class, subject, and date to view students'
                : 'No students found for this class'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Action Bar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllPresent}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All Present
                </button>
              </div>

              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Unsaved changes
                  </span>
                )}
                <button
                  onClick={saveAttendance}
                  disabled={saving || !hasUnsavedChanges}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStudentStatus(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              student.status === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => updateStudentStatus(student.id, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              student.status === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => updateStudentStatus(student.id, 'late')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              student.status === 'late'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => updateStudentStatus(student.id, 'excused')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              student.status === 'excused'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}