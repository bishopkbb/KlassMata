// app/teacher/classes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Search,
  GraduationCap
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Class {
  id: string
  name: string
  grade: string
  section: string
  capacity: number
  studentCount: number
  subjects: {
    id: string
    name: string
    code: string
  }[]
}

export default function MyClassesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/teacher/classes')
      
      if (res.status === 401) {
        toast.error('Please log in')
        router.push('/auth/login')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setClasses(data.classes || [])
      } else {
        toast.error('Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <p className="text-gray-600 mt-1">Manage your assigned classes</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-700">{classes.length}</div>
              <div className="text-sm text-gray-600">Total Classes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search classes by name or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'You have not been assigned to any classes yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/classes/${cls.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-500 transition-all duration-200 group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {cls.grade} {cls.section && `- ${cls.section}`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-emerald-600" />
                      <span className="text-sm">
                        {cls.studentCount} / {cls.capacity} students
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm">
                        {cls.subjects.length} subject{cls.subjects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Capacity</span>
                      <span>{Math.round((cls.studentCount / cls.capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          cls.studentCount / cls.capacity > 0.9
                            ? 'bg-red-500'
                            : cls.studentCount / cls.capacity > 0.7
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((cls.studentCount / cls.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Subjects */}
                  {cls.subjects.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {cls.subjects.slice(0, 3).map((subject) => (
                          <span
                            key={subject.id}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {subject.name}
                          </span>
                        ))}
                        {cls.subjects.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{cls.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}