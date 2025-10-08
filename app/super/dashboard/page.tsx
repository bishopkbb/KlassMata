// app/super/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Building2, 
  Users, 
  Shield, 
  BarChart3, 
  CreditCard, 
  Settings,
  UserPlus,
  ArrowUp,
  Loader2,
  Search,
  Filter
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  school?: {
    name: string
  }
}

export default function SuperAdminDashboard() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const stats = [
    {
      title: 'Total Schools',
      value: '127',
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Users',
      value: users.length.toLocaleString(),
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Active Admins',
      value: users.filter(u => u.role === 'admin').length.toString(),
      icon: Shield,
      color: 'bg-purple-500',
      change: '+15%',
    },
    {
      title: 'Monthly Revenue',
      value: '₦2.4M',
      icon: CreditCard,
      color: 'bg-orange-500',
      change: '+23%',
    },
  ]

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Promote teacher to admin
  const handlePromoteUser = async (userId: string) => {
    setUpgrading(userId)
    try {
      const response = await fetch(`/api/users/${userId}/upgrade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, role: updatedUser.user.role }
            : user
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to promote user')
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      alert('Failed to promote user')
    } finally {
      setUpgrading(null)
    }
  }

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const roleClasses = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      parent: 'bg-gray-100 text-gray-800',
    }

    const roleNames = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleClasses[role as keyof typeof roleClasses] || roleClasses.teacher}`}>
        {roleNames[role as keyof typeof roleNames] || role}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(" ")[0]}!

        </h1>
        <p className="text-purple-100">
          Super Administrator Dashboard - Manage all schools and system settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Admins</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.school?.name || 'No School'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role === 'teacher' && (
                        <button
                          onClick={() => handlePromoteUser(user.id)}
                          disabled={upgrading === user.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {upgrading === user.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Promoting...
                            </>
                          ) : (
                            <>
                              <ArrowUp className="w-3 h-3 mr-1" />
                              Promote to Admin
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              System Management
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Manage Schools</div>
              <div className="text-sm text-gray-600">Add, edit, and monitor all schools</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Subscription Plans</div>
              <div className="text-sm text-gray-600">Manage pricing and features</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">System Settings</div>
              <div className="text-sm text-gray-600">Configure global system settings</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics Overview
            </h2>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">System analytics charts will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}