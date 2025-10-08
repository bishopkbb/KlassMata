// app/admin/attendance/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Search, 
  Download,
  ArrowLeft,
  Check,
  X,
  Clock,
  Users,
  Filter,
  FileText
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Student {
  id: string
  studentId: string
  name: string
  className: string
  status: 'present' | 'absent' | 'late' | 'excused' | null
}

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

export default function AttendancePage() {
  const router = useRouter()
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedClass !== 'all') {
      fetchStudents()
    }
  }, [selectedClass, selectedDate])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data.map((c: any) => c.name))
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
        setSubjects(data.map((s: any) => s.name))
      }
    } catch (error) {
      console.error('Failed to fetch subjects')
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/attendance?class=${selectedClass}&date=${selectedDate}`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (error) {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status } : student
    ))
  }

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'present' as const })))
    toast.success('All students marked present')
  }

  const handleSave = async () => {
    if (selectedClass === 'all') {
      toast.error('Please select a class first')
      return
    }

    if (selectedSubject === 'all') {
      toast.error('Please select a subject')
      return
    }

    const unmarkedStudents = students.filter(s => !s.status)
    if (unmarkedStudents.length > 0) {
      if (!confirm(`${unmarkedStudents.length} students are not marked. Continue?`)) {
        return
      }
    }

    try {
      setSaving(true)
      const attendanceData = students
        .filter(s => s.status)
        .map(s => ({
          studentId: s.id,
          status: s.status,
          date: selectedDate,
          classId: selectedClass,
          subjectId: selectedSubject
        }))

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceData })
      })

      if (res.ok) {
        toast.success('Attendance saved successfully!')
      } else {
        toast.error('Failed to save attendance')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const exportAttendance = async () => {
    if (selectedClass === 'all') {
      toast.error('Please select a class to export')
      return
    }

    try {
      const res = await fetch(`/api/attendance/export?class=${selectedClass}&date=${selectedDate}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-${selectedClass}-${selectedDate}.pdf`
        a.click()
        toast.success('Attendance exported successfully!')
      }
    } catch (error) {
      toast.error('Failed to export attendance')
    }
  }

  const stats: AttendanceStats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    excused: students.filter(s => s.status === 'excused').length,
    percentage: students.length > 0 
      ? Math.round((students.filter(s => s.status === 'present').length / students.length) * 100)
      : 0
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
              <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportAttendance}
                disabled={selectedClass === 'all'}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              >
                <option value="all">Select a class</option>
                {classes.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              >
                <option value="all">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {selectedClass !== 'all' && students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
              <p className="text-sm text-green-700 mb-1">Present</p>
              <p className="text-2xl font-bold text-green-900">{stats.present}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
              <p className="text-sm text-red-700 mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
              <p className="text-sm text-yellow-700 mb-1">Late</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.late}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
              <p className="text-sm text-blue-700 mb-1">Attendance</p>
              <p className="text-2xl font-bold text-blue-900">{stats.percentage}%</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedClass === 'all' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Class to Begin
            </h3>
            <p className="text-gray-600">
              Choose a class and subject from the filters above to mark attendance
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Actions Bar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllPresent}
                  disabled={loading || students.length === 0}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Present
                </button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || students.length === 0}
                className="flex items-center px-6 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>

            {/* Students List */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No students found in this class</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-purple-700 font-semibold text-sm">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => markAttendance(student.id, 'present')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'present'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                              }`}
                              title="Present"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, 'absent')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'absent'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                              }`}
                              title="Absent"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, 'late')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'late'
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                              }`}
                              title="Late"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, 'excused')}
                              className={`p-2 rounded-lg transition-colors ${
                                student.status === 'excused'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                              title="Excused"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}