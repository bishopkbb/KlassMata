'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, RefreshCw, Search, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'  // make sure you install/react-hot-toast

// The subject list (as above)
const ALL_NSS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Digital Technologies / ICT",
  "One Nigerian Language",
  "Citizenship & Heritage Studies",
  "Biology",
  "Chemistry",
  "Physics",
  "Further Mathematics",
  "Agricultural Science",
  "Physical & Health Education",
  "Technical Drawing",
  "Food & Nutrition",
  "Health Education",
  "Nigerian History",
  "Government",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Literature in English",
  "French",
  "Arabic",
  "Visual Arts",
  "Music",
  "Home Management",
  "Catering Craft",
  "Economics",
  "Commerce",
  "Accounting",
  "Marketing",
  "Fashion Design & Garment Making",
  "Solar Photovoltaic Installation & Maintenance",
  "Computer Hardware & GSM Repairs",
  "Livestock Farming",
  "Beauty & Cosmetology",
  "Horticulture & Crop Production"
]

interface Course {
  id: string
  code: string
  title: string
  teacher: string
  enrolled: number
  status: 'active' | 'inactive'
  subjects: string[]   // new field
}

export default function AdminCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // For modal state:
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form state for add/edit
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    teacher: "",
    status: "active" as 'active' | 'inactive',
    subjects: [] as string[],
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/courses')
      if (res.ok) {
        const data = await res.json()
        // Expect data to include subjects
        setCourses(data)
      } else {
        loadMockData()
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    setCourses([
      { id: '1', code: 'MTH101', title: 'Mathematics Basics', teacher: 'Mr. Johnson', enrolled: 120, status: 'active', subjects: ["Mathematics", "English Language"] },
      { id: '2', code: 'ENG201', title: 'English Literature', teacher: 'Mrs. Smith', enrolled: 85, status: 'active', subjects: ["English Language", "Literature in English"] },
      { id: '3', code: 'SCI301', title: 'Basic Science', teacher: 'Dr. Brown', enrolled: 64, status: 'inactive', subjects: ["Biology", "Chemistry", "Physics"] },
    ])
  }

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.toLowerCase().includes(search.toLowerCase())
  )

  const openAddModal = () => {
    setEditingCourse(null)
    setFormData({ code: "", title: "", teacher: "", status: 'active', subjects: [] })
    setShowModal(true)
  }

  const openEditModal = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      code: course.code,
      title: course.title,
      teacher: course.teacher,
      status: course.status,
      subjects: course.subjects,
    })
    setShowModal(true)
  }

  const handleFormChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.code.trim() || !formData.title.trim() || !formData.teacher.trim() || formData.subjects.length === 0) {
      toast.error("Please fill all required fields and select at least one subject.")
      return
    }
    // If editing
    if (editingCourse) {
      // call API to update
      try {
        // Example: await fetch(`/api/admin/courses/${editingCourse.id}`, { method: 'PUT', body: JSON.stringify(formData) })
        toast.success("Course updated (mock)")
        // Update locally
        setCourses(prev =>
          prev.map(c => c.id === editingCourse.id ? { ...c, ...formData } as Course : c)
        )
      } catch (err) {
        toast.error("Error updating course")
      }
    } else {
      // Create new
      try {
        // Example: await fetch(`/api/admin/courses`, { method: 'POST', body: JSON.stringify(formData) })
        const newCourse: Course = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          enrolled: 0,  // new course has zero initially
        }
        setCourses(prev => [newCourse, ...prev])
        toast.success("Course added (mock)")
      } catch (err) {
        toast.error("Error adding course")
      }
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    // confirm first
    if (!confirm("Are you sure you want to delete this course?")) return

    // mock delete
    setCourses(prev => prev.filter(c => c.id !== id))
    toast.success("Course deleted (mock)")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses Management</h1>
          <p className="text-blue-100 mt-2">Manage all school courses, teachers, and enrollments</p>
        </div>
        <div className="flex gap-3 mt-6 md:mt-0">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-gray-100 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </button>
          <button
            onClick={fetchCourses}
            className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg shadow-sm hover:bg-white/30 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by course, code, or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
          <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-6">
          <h3 className="text-sm font-medium text-gray-600">Active Courses</h3>
          <p className="text-2xl font-bold text-gray-900">
            {courses.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6">
          <h3 className="text-sm font-medium text-gray-600">Inactive Courses</h3>
          <p className="text-2xl font-bold text-gray-900">
            {courses.filter(c => c.status === 'inactive').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subjects Offered</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCourses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{course.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.teacher}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.enrolled}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {course.subjects.join(", ")}
                </td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <button onClick={() => openEditModal(course)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-gray-500 text-sm">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4">{editingCourse ? "Edit Course" : "Add Course"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Course Code*</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => handleFormChange('code', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Course Title*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => handleFormChange('title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Assigned Teacher*</label>
                <input
                  type="text"
                  value={formData.teacher}
                  onChange={e => handleFormChange('teacher', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status*</label>
                <select
                  value={formData.status}
                  onChange={e => handleFormChange('status', e.target.value as 'active' | 'inactive')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Subjects Offered*</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded-lg">
                  {ALL_NSS_SUBJECTS.map(subject => (
                    <label key={subject} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={e => {
                          const checked = e.target.checked
                          setFormData(prev => {
                            if (checked) {
                              return { ...prev, subjects: [...prev.subjects, subject] }
                            } else {
                              return { ...prev, subjects: prev.subjects.filter(s => s !== subject) }
                            }
                          })
                        }}
                        className="form-checkbox h-5 w-5 text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded bg-emerald-900 text-white hover:bg-emerald-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
