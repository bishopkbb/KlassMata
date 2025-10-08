// app/teacher/students/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users,
  ArrowLeft,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Eye,
  Download,
  BookOpen
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  className: string
  classId: string
  admissionDate: string
  attendanceRate: number
  averageGrade: number
}

interface Class {
  id: string
  name: string
}

export default function StudentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch classes
      const classesRes = await fetch('/api/teacher/classes')
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setClasses(classesData.classes || [])
      }

      // Fetch students
      const studentsRes = await fetch('/api/teacher/students')
      if (studentsRes.status === 401) {
        toast.error('Please log in')
        router.push('/auth/login')
        return
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(studentsData.students || [])
      } else {
        toast.error('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredStudents = () => {
    let filtered = students

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.classId === selectedClass)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredStudents = getFilteredStudents()

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Class', 'Attendance Rate', 'Average Grade']
    const data = filteredStudents.map(s => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.email || 'N/A',
      s.phone || 'N/A',
      s.className,
      `${s.attendanceRate}%`,
      `${s.averageGrade}%`
    ])

    const csv = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Students exported to CSV')
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 70) return 'text-green-600'
    if (grade >= 50) return 'text-yellow-600'
    return 'text-red-600'
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
              <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
              <p className="text-gray-600 mt-1">View all students in your classes</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-700">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
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
                placeholder="Search by name, student ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Class Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredStudents.length === 0}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedClass !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no students in your classes yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Grade
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-emerald-700 font-semibold">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {student.email && (
                            <div className="flex items-center text-gray-600 mb-1">
                              <Mail className="w-4 h-4 mr-2" />
                              {student.email}
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              {student.phone}
                            </div>
                          )}
                          {!student.email && !student.phone && (
                            <span className="text-gray-400">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                          {student.className}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-lg font-semibold ${getAttendanceColor(student.attendanceRate)}`}>
                          {student.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-lg font-semibold ${getGradeColor(student.averageGrade)}`}>
                          {student.averageGrade}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => router.push(`/teacher/students/${student.id}`)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
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