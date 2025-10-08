// app/teacher/gradebook/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Search,
  Download,
  Filter,
  Save,
  CheckCircle,
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

interface Assignment {
  id: string
  title: string
  maxPoints: number
}

interface StudentGrade {
  studentId: string
  studentName: string
  studentNumber: string
  grades: {
    assignmentId: string
    points: number | null
    feedback: string | null
    submissionId: string | null
  }[]
}

export default function GradebookPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<StudentGrade[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
    if (selectedClass && selectedSubject) {
      fetchGradebook()
    }
  }, [selectedClass, selectedSubject])

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

  const fetchGradebook = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/teacher/gradebook?classId=${selectedClass}&subjectId=${selectedSubject}`
      )
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
        setStudents(data.students || [])
        setHasUnsavedChanges(false)
      } else {
        toast.error('Failed to load gradebook')
      }
    } catch (error) {
      console.error('Error fetching gradebook:', error)
      toast.error('Failed to load gradebook')
    } finally {
      setLoading(false)
    }
  }

  const updateGrade = (studentId: string, assignmentId: string, points: number | null) => {
    setStudents(prev =>
      prev.map(student =>
        student.studentId === studentId
          ? {
              ...student,
              grades: student.grades.map(grade =>
                grade.assignmentId === assignmentId
                  ? { ...grade, points }
                  : grade
              ),
            }
          : student
      )
    )
    setHasUnsavedChanges(true)
  }

  const saveGrades = async () => {
    try {
      setSaving(true)
      
      const gradesToSave = students.flatMap(student =>
        student.grades
          .filter(grade => grade.points !== null && grade.submissionId)
          .map(grade => ({
            submissionId: grade.submissionId,
            points: grade.points,
          }))
      )

      const res = await fetch('/api/teacher/gradebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: gradesToSave }),
      })

      if (res.ok) {
        toast.success('Grades saved successfully!')
        setHasUnsavedChanges(false)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save grades')
      }
    } catch (error) {
      console.error('Error saving grades:', error)
      toast.error('Failed to save grades')
    } finally {
      setSaving(false)
    }
  }

  const calculateStudentAverage = (student: StudentGrade) => {
    const validGrades = student.grades.filter(g => g.points !== null && g.points !== undefined)
    if (validGrades.length === 0) return '-'
    
    const totalPoints = validGrades.reduce((sum, g) => sum + (g.points || 0), 0)
    const totalMaxPoints = validGrades.reduce((sum, g) => {
      const assignment = assignments.find(a => a.id === g.assignmentId)
      return sum + (assignment?.maxPoints || 0)
    }, 0)
    
    if (totalMaxPoints === 0) return '-'
    return Math.round((totalPoints / totalMaxPoints) * 100)
  }

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
              <p className="text-gray-600 mt-1">View and enter student grades</p>
            </div>
            {hasUnsavedChanges && (
              <button
                onClick={saveGrades}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save All Grades'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Selection Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  setAssignments([])
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
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
                  setAssignments([])
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
          </div>

          {/* Search */}
          {students.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <p className="text-sm text-yellow-800">
                You have unsaved changes. Don't forget to save your grades!
              </p>
            </div>
          </div>
        )}

        {/* Gradebook Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gradebook...</p>
          </div>
        ) : !selectedClass || !selectedSubject ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Class and Subject</h3>
            <p className="text-gray-600">
              Please select a class and subject to view the gradebook
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'No students enrolled in this class'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                      Student
                    </th>
                    {assignments.map(assignment => (
                      <th
                        key={assignment.id}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[120px]"
                      >
                        <div>{assignment.title}</div>
                        <div className="text-gray-400 font-normal mt-1">
                          /{assignment.maxPoints}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50">
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const average = calculateStudentAverage(student)
                    return (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-emerald-700 font-semibold text-sm">
                                {student.studentName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {student.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.studentNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        {assignments.map(assignment => {
                          const grade = student.grades.find(
                            g => g.assignmentId === assignment.id
                          )
                          return (
                            <td key={assignment.id} className="px-4 py-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max={assignment.maxPoints}
                                step="0.1"
                                value={grade?.points ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  updateGrade(
                                    student.studentId,
                                    assignment.id,
                                    value === '' ? null : parseFloat(value)
                                  )
                                }}
                                placeholder="-"
                                disabled={!grade?.submissionId}
                                className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                            </td>
                          )
                        })}
                        <td className="px-6 py-4 text-center font-semibold sticky right-0 bg-white">
                          {average === '-' ? (
                            <span className="text-gray-400">{average}</span>
                          ) : (
                            <span
                              className={`${
                                average >= 70
                                  ? 'text-green-600'
                                  : average >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {average}%
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}