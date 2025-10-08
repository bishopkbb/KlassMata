// app/admin/students/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth: string
  gender: string
  className: string
  admissionDate: string
  isActive: boolean
}

export default function StudentsPage() {
  const router = useRouter()
  
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [classes, setClasses] = useState<string[]>([])

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/students')
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== id))
        toast.success('Student deleted successfully!')
      } else {
        toast.error('Failed to delete student')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Class', 'Gender', 'Admission Date']
    const rows = filteredStudents.map(s => [
      s.studentId,
      `${s.firstName} ${s.lastName}`,
      s.email || 'N/A',
      s.className,
      s.gender,
      new Date(s.admissionDate).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Students exported successfully!')
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesClass = filterClass === 'all' || student.className === filterClass

    return matchesSearch && matchesClass
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
              <h1 className="text-3xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600 mt-1">Manage student enrollments</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => router.push('/admin/students/new')}
                className="flex items-center px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Students</p>
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active</p>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {students.filter(s => s.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Male</p>
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {students.filter(s => s.gender.toLowerCase() === 'male').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Female</p>
              <User className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {students.filter(s => s.gender.toLowerCase() === 'female').length}
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
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                {classes.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Students ({filteredStudents.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No students found</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {student.studentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-purple-700 font-semibold">
                              {student.firstName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.email && (
                              <div className="text-xs text-gray-500">{student.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {student.className}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(student.admissionDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/students/${student.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  )
}