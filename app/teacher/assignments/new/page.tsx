// app/teacher/assignments/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Class {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
  code: string
}

export default function NewAssignmentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '',
    maxPoints: 100,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (formData.classId) {
      fetchSubjects(formData.classId)
    } else {
      setSubjects([])
      setFormData(prev => ({ ...prev, subjectId: '' }))
    }
  }, [formData.classId])

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
      setLoading(true)
      const res = await fetch(`/api/teacher/classes/${classId}/subjects`)
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.classId) {
      newErrors.classId = 'Class is required'
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Subject is required'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    } else {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }

    if (formData.maxPoints <= 0) {
      newErrors.maxPoints = 'Max points must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Assignment created successfully!')
        router.push(`/teacher/assignments/${data.assignment.id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create assignment')
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error('Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/teacher/assignments"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
            <p className="text-gray-600 mt-1">Give your students new work</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Chapter 5 Reading Assignment"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Provide detailed instructions for the assignment..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Class and Subject Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class */}
                <div>
                  <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    id="classId"
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.classId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {errors.classId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.classId}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    disabled={!formData.classId || loading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.subjectId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.subjectId}
                    </p>
                  )}
                </div>
              </div>

              {/* Due Date and Max Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Due Date */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.dueDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Max Points */}
                <div>
                  <label htmlFor="maxPoints" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Points *
                  </label>
                  <input
                    type="number"
                    id="maxPoints"
                    name="maxPoints"
                    value={formData.maxPoints}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.maxPoints ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxPoints && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.maxPoints}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}