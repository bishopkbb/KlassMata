// app/admin/classes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  User,
  ArrowLeft,
  GraduationCap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Class {
  id: string
  name: string
  grade: string
  section?: string
  capacity: number
  teacherName: string
  studentCount: number
  subjects: number
  isActive: boolean
}

export default function ClassesPage() {
  const router = useRouter()
  
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    capacity: '30',
    teacherId: '',
  })

  useEffect(() => {
    fetchClasses()
    fetchTeachers()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      toast.error('Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers')
      if (res.ok) {
        const data = await res.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error('Failed to fetch teachers')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingClass ? 'PUT' : 'POST'
      const url = editingClass 
        ? `/api/classes/${editingClass.id}` 
        : '/api/classes'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity)
        }),
      })

      if (res.ok) {
        toast.success(editingClass ? 'Class updated!' : 'Class created!')
        setShowAddModal(false)
        setEditingClass(null)
        setFormData({ name: '', grade: '', section: '', capacity: '30', teacherId: '' })
        fetchClasses()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save class')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== id))
        toast.success('Class deleted successfully!')
      } else {
        toast.error('Failed to delete class')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      grade: classItem.grade,
      section: classItem.section || '',
      capacity: classItem.capacity.toString(),
      teacherId: '', // You'll need to store teacher ID in the class object
    })
    setShowAddModal(true)
  }

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
              <p className="text-gray-600 mt-1">Manage classes and sections</p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true)
                setEditingClass(null)
                setFormData({ name: '', grade: '', section: '', capacity: '30', teacherId: '' })
              }}
              className="flex items-center px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Class
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Classes</p>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Classes</p>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {classes.filter(c => c.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Students</p>
              <GraduationCap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {classes.reduce((sum, c) => sum + c.studentCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg. Class Size</p>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {classes.length > 0 
                ? Math.round(classes.reduce((sum, c) => sum + c.studentCount, 0) / classes.length)
                : 0
              }
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search classes by name, grade, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No classes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Grade {classItem.grade} {classItem.section && `• Section ${classItem.section}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      classItem.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Teacher: {classItem.teacherName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Students: {classItem.studentCount} / {classItem.capacity}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{classItem.subjects} Subjects</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Capacity</span>
                      <span>{Math.round((classItem.studentCount / classItem.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          (classItem.studentCount / classItem.capacity) > 0.9
                            ? 'bg-red-600'
                            : (classItem.studentCount / classItem.capacity) > 0.7
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{
                          width: `${Math.min((classItem.studentCount / classItem.capacity) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/classes/${classItem.id}`)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit class"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics 101"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade *
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g., A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Teacher *
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingClass(null)
                    setFormData({ name: '', grade: '', section: '', capacity: '30', teacherId: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}