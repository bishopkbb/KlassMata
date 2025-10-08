// app/components/layout/Sidebar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { UserRole } from '@prisma/client'
import {
  BookOpen,
  Home,
  Users,
  Calendar,
  FileText,
  BarChart3,
  CreditCard,
  GraduationCap,
  Settings,
  Shield,
  Building2,
  UserPlus,
  ClipboardCheck,
  Award,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

// Navigation items based on user role
const getNavigationItems = (userRole: UserRole) => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: `/${userRole.replace('_', '')}/dashboard`,
      icon: Home,
    },
  ]

  switch (userRole) {
    case UserRole.super_admin:
      return [
        ...baseItems,
        {
          name: 'Schools',
          href: '/super/schools',
          icon: Building2,
        },
        {
          name: 'All Users',
          href: '/super/users',
          icon: Users,
        },
        {
          name: 'System Settings',
          href: '/super/settings',
          icon: Settings,
        },
        {
          name: 'Analytics',
          href: '/super/analytics',
          icon: BarChart3,
        },
        {
          name: 'Subscriptions',
          href: '/super/subscriptions',
          icon: CreditCard,
        },
        {
          name: 'Support',
          href: '/super/support',
          icon: HelpCircle,
        },
      ]

    case UserRole.admin:
      return [
        ...baseItems,
        {
          name: 'Teachers',
          href: '/admin/teachers',
          icon: Users,
        },
        {
          name: 'Students',
          href: '/admin/students',
          icon: GraduationCap,
        },
        {
          name: 'Classes',
          href: '/admin/classes',
          icon: BookOpen,
        },
        {
          name: 'Subjects',
          href: '/admin/subjects',
          icon: FileText,
        },
        {
          name: 'Reports',
          href: '/admin/reports',
          icon: BarChart3,
        },
        {
          name: 'Payments',
          href: '/admin/payments',
          icon: CreditCard,
        },
        {
          name: 'School Settings',
          href: '/admin/settings',
          icon: Settings,
        },
      ]

    case UserRole.teacher:
      return [
        ...baseItems,
        {
          name: 'My Classes',
          href: '/teacher/classes',
          icon: BookOpen,
        },
        {
          name: 'Students',
          href: '/teacher/students',
          icon: GraduationCap,
        },
        {
          name: 'Attendance',
          href: '/teacher/attendance',
          icon: Calendar,
        },
        {
          name: 'Assignments',
          href: '/teacher/assignments',
          icon: FileText,
        },
        {
          name: 'Exams',
          href: '/teacher/exams',
          icon: ClipboardCheck,
        },
        {
          name: 'Grades',
          href: '/teacher/grades',
          icon: Award,
        },
        {
          name: 'Reports',
          href: '/teacher/reports',
          icon: BarChart3,
        },
      ]

    case UserRole.student:
      return [
        ...baseItems,
        {
          name: 'My Classes',
          href: '/student/classes',
          icon: BookOpen,
        },
        {
          name: 'Assignments',
          href: '/student/assignments',
          icon: FileText,
        },
        {
          name: 'Exams',
          href: '/student/exams',
          icon: ClipboardCheck,
        },
        {
          name: 'Grades',
          href: '/student/grades',
          icon: Award,
        },
        {
          name: 'Attendance',
          href: '/student/attendance',
          icon: Calendar,
        },
        {
          name: 'Schedule',
          href: '/student/schedule',
          icon: Calendar,
        },
      ]

    case UserRole.parent:
      return [
        ...baseItems,
        {
          name: 'My Children',
          href: '/parent/children',
          icon: Users,
        },
        {
          name: 'Academic Progress',
          href: '/parent/progress',
          icon: BarChart3,
        },
        {
          name: 'Attendance',
          href: '/parent/attendance',
          icon: Calendar,
        },
        {
          name: 'Payments',
          href: '/parent/payments',
          icon: CreditCard,
        },
        {
          name: 'Communications',
          href: '/parent/messages',
          icon: Bell,
        },
      ]

    default:
      return baseItems
  }
}

// Get role-specific colors
const getRoleColors = (userRole: UserRole) => {
  switch (userRole) {
    case UserRole.super_admin:
      return {
        primary: 'from-red-600 to-purple-600',
        accent: 'text-red-400',
        sidebar: 'bg-gray-900',
        hover: 'hover:bg-gray-700',
        active: 'bg-gray-700 text-white',
        inactive: 'text-gray-300 hover:text-white',
      }
    case UserRole.admin:
      return {
        primary: 'from-blue-600 to-purple-600',
        accent: 'text-purple-400',
        sidebar: 'bg-blue-900',
        hover: 'hover:bg-blue-800',
        active: 'bg-blue-800 text-white',
        inactive: 'text-blue-100 hover:text-white',
      }
    case UserRole.teacher:
      return {
        primary: 'from-green-600 to-blue-600',
        accent: 'text-yellow-400',
        sidebar: 'bg-green-800',
        hover: 'hover:bg-green-700',
        active: 'bg-green-700 text-white',
        inactive: 'text-green-100 hover:text-white',
      }
    case UserRole.student:
      return {
        primary: 'from-indigo-600 to-purple-600',
        accent: 'text-indigo-400',
        sidebar: 'bg-indigo-800',
        hover: 'hover:bg-indigo-700',
        active: 'bg-indigo-700 text-white',
        inactive: 'text-indigo-100 hover:text-white',
      }
    case UserRole.parent:
      return {
        primary: 'from-pink-600 to-purple-600',
        accent: 'text-pink-400',
        sidebar: 'bg-pink-800',
        hover: 'hover:bg-pink-700',
        active: 'bg-pink-700 text-white',
        inactive: 'text-pink-100 hover:text-white',
      }
    default:
      return {
        primary: 'from-green-600 to-blue-600',
        accent: 'text-yellow-400',
        sidebar: 'bg-green-800',
        hover: 'hover:bg-green-700',
        active: 'bg-green-700 text-white',
        inactive: 'text-green-100 hover:text-white',
      }
  }
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  if (!session?.user?.role) return null
  
  const userRole = session.user.role as UserRole
  const navigation = getNavigationItems(userRole)
  const colors = getRoleColors(userRole)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.super_admin:
        return 'Super Admin'
      case UserRole.admin:
        return 'Administrator'
      case UserRole.teacher:
        return 'Teacher'
      case UserRole.student:
        return 'Student'
      case UserRole.parent:
        return 'Parent'
      default:
        return role
    }
  }

  return (
    <div className={`flex flex-col w-64 ${colors.sidebar} min-h-screen`}>
      {/* Logo */}
      <div className={`flex items-center justify-center h-16 px-4 bg-gradient-to-r ${colors.primary}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            KLASS<span className={colors.accent}>MATA</span>
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            {userRole === UserRole.super_admin && <Shield className="w-5 h-5 text-white" />}
            {userRole === UserRole.admin && <Settings className="w-5 h-5 text-white" />}
            {userRole === UserRole.teacher && <Users className="w-5 h-5 text-white" />}
            {userRole === UserRole.student && <GraduationCap className="w-5 h-5 text-white" />}
            {userRole === UserRole.parent && <Users className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session.user.firstName} {session.user.lastName}
            </p>
            <p className={`text-xs ${colors.inactive} truncate`}>
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? colors.active
                  : `${colors.inactive} ${colors.hover}`
              )}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-gray-700 space-y-2">
        <Link
          href="/profile"
          className={cn(
            'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
            `${colors.inactive} ${colors.hover}`
          )}
        >
          <Settings className="w-5 h-5 mr-3" />
          Profile Settings
        </Link>
        
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
            `${colors.inactive} ${colors.hover}`
          )}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}