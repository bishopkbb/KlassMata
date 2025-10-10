// app/page.tsx - Mobile improvements
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Calendar,
  BarChart3,
  BookOpen,
  Menu,
} from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header - Mobile responsive */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* KlassMata Logo */}
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3" />
                  <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5" />
                  <path
                    d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                    fill="#fbbf24"
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">
                  <span className="text-[#22c55e]">KLASS</span>
                  <span className="text-[#fbbf24]">MATA</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm md:text-base"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-[#22c55e] text-white px-3 py-1.5 md:px-6 md:py-2 rounded-lg hover:bg-[#16a34a] transition-colors font-medium text-sm md:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile responsive */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="text-center mb-12 md:mb-20">
          {/* Large Logo */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative w-16 h-16 md:w-24 md:h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3" />
                <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5" />
                <path
                  d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                  fill="#fbbf24"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
            Complete School
            <span className="block text-[#22c55e]">Management System</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Streamline your school operations with KlassMata. Manage students,
            teachers, attendance, exams, and payments all in one powerful
            platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-[#22c55e] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-[#16a34a] transition-colors font-semibold text-base md:text-lg flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-base md:text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid - Mobile responsive */}
        <div
          id="features"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-20"
        >
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Student Management
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Comprehensive student profiles, enrollment tracking, and academic
              records management.
            </p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Attendance Tracking
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Real-time attendance monitoring with automated reports and
              notifications.
            </p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Exam Management
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Create, schedule, and grade exams with detailed analytics and
              insights.
            </p>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Analytics & Reports
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Powerful insights and detailed reports to track school
              performance.
            </p>
          </div>
        </div>

        {/* CTA Section - Mobile responsive */}
        <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-xl md:rounded-2xl p-6 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-base md:text-xl text-green-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of schools already using KlassMata to streamline
            their operations and improve educational outcomes.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex bg-white text-[#22c55e] px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-base md:text-lg items-center space-x-2"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
      </main>

      {/* Footer - Mobile responsive */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              {/* KlassMata Logo */}
              <div className="relative w-8 h-8">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3" />
                  <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5" />
                  <path
                    d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                    fill="#fbbf24"
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-bold">
                <span className="text-[#22c55e]">KLASS</span>
                <span className="text-[#fbbf24]">MATA</span>
              </span>
            </div>
            <div className="text-gray-400 text-xs md:text-sm text-center">
              © 2025 KlassMata. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
