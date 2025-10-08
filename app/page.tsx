// app/page.tsx

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import Link from 'next/link'
import { ArrowRight, Users, Calendar, BarChart3, BookOpen } from 'lucide-react'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              {/* KlassMata Logo */}
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3"/>
                  <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5"/>
                  <path
                    d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                    fill="#fbbf24"
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-[#22c55e]">KLASS</span>
                  <span className="text-[#fbbf24]">MATA</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-[#22c55e] text-white px-6 py-2 rounded-lg hover:bg-[#16a34a] transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          {/* Large Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3"/>
                <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5"/>
                <path
                  d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                  fill="#fbbf24"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Complete School
            <span className="block text-[#22c55e]">Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your school operations with KlassMata. Manage students, teachers, 
            attendance, exams, and payments all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="bg-[#22c55e] text-white px-8 py-4 rounded-xl hover:bg-[#16a34a] transition-colors font-semibold text-lg flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Management</h3>
            <p className="text-gray-600">
              Comprehensive student profiles, enrollment tracking, and academic records management.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Tracking</h3>
            <p className="text-gray-600">
              Real-time attendance monitoring with automated reports and notifications.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam Management</h3>
            <p className="text-gray-600">
              Create, schedule, and grade exams with detailed analytics and insights.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">
              Powerful insights and detailed reports to track school performance.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your School?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of schools already using KlassMata to streamline their operations 
            and improve educational outcomes.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-[#22c55e] px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg inline-flex items-center space-x-2"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {/* KlassMata Logo */}
              <div className="relative w-8 h-8">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3"/>
                  <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5"/>
                  <path
                    d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                    fill="#fbbf24"
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">
                <span className="text-[#22c55e]">KLASS</span>
                <span className="text-[#fbbf24]">MATA</span>
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 KlassMata. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}