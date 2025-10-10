// app/teacher/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Home,
  Bell,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  todayClasses: number;
  pendingAssignments: number;
  attendanceMarked: number;
}

interface UpcomingClass {
  id: string;
  name: string;
  time: string;
  room: string;
  students: number;
}

interface RecentActivity {
  id: string;
  action: string;
  time: string;
  type: string;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingAssignments: 0,
    attendanceMarked: 0,
  });

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const statsRes = await fetch("/api/teacher/dashboard/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setUpcomingClasses(data.upcomingClasses || []);
        }
        const actRes = await fetch("/api/teacher/dashboard/activities");
        if (actRes.ok) {
          const data = await actRes.json();
          setRecentActivities(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/teacher/dashboard",
      active: true,
    },
    { icon: BookOpen, label: "My Classes", href: "/teacher/classes" },
    { icon: Calendar, label: "Attendance", href: "/teacher/attendance" },
    { icon: FileText, label: "Assignments", href: "/teacher/assignments" },
    { icon: ClipboardList, label: "Gradebook", href: "/teacher/gradebook" },
    { icon: Users, label: "Students", href: "/teacher/students" },
    { icon: MessageSquare, label: "Messages", href: "/teacher/messages" },
  ];

  const statCards = [
    {
      title: "My Classes",
      value: stats.totalClasses,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/teacher/classes",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/teacher/students",
    },
    {
      title: "Today's Classes",
      value: stats.todayClasses,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/teacher/classes",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingAssignments,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/teacher/assignments",
    },
  ];

  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Record student attendance",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      action: () => router.push("/teacher/attendance"),
    },
    {
      title: "Create Assignment",
      description: "Give students new work",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: () => router.push("/teacher/assignments/new"),
    },
    {
      title: "Grade Submissions",
      description: "Review student work",
      icon: ClipboardList,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: () => router.push("/teacher/gradebook"),
    },
    {
      title: "View Students",
      description: "See your class roster",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      action: () => router.push("/teacher/students"),
    },
  ];

  const getActivityIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case "attendance":
        return <Calendar className={`${iconClass} text-green-500`} />;
      case "assignment":
        return <FileText className={`${iconClass} text-blue-500`} />;
      case "grade":
        return <ClipboardList className={`${iconClass} text-purple-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
            <h1 className="text-lg font-bold">
              <span className="text-[#22c55e]">KLASS</span>
              <span className="text-[#fbbf24]">MATA</span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white flex-shrink-0 fixed h-full overflow-y-auto z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <div className="mb-8">
            <div className="text-center mb-2">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="#22c55e"
                      opacity="0.3"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="#22c55e"
                      opacity="0.5"
                    />
                    <path
                      d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                      fill="#fbbf24"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-1">
                <span className="text-[#22c55e]">KLASS</span>
                <span className="text-[#fbbf24]">MATA</span>
              </h1>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/70">Teacher Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${item.active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Welcome back, {session?.user?.firstName || "Teacher"}
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm md:text-lg">
                  {session?.user?.firstName?.[0] || "T"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-5 md:p-6 border border-gray-200 animate-pulse"
                  >
                    <div className="h-12 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))
              : statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Link
                      key={stat.title}
                      href={stat.href}
                      className="bg-white rounded-lg shadow-sm p-5 md:p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div
                          className={`${stat.bgColor} p-2.5 md:p-3 rounded-lg`}
                        >
                          <Icon
                            className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`}
                          />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {stat.title}
                      </div>
                    </Link>
                  );
                })}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={action.action}
                          className="p-4 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex items-center mb-2 md:mb-3">
                            <div
                              className={`${action.bgColor} p-2 rounded-lg mr-3`}
                            >
                              <Icon
                                className={`w-4 h-4 md:w-5 md:h-5 ${action.color}`}
                              />
                            </div>
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-emerald-700">
                              {action.title}
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600">
                            {action.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 md:p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="mt-1 mr-2 md:mr-3">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-900">
                              {activity.action}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 md:p-8 text-center text-gray-500">
                      <Bell className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Today&apos;s Classes
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-100 rounded-lg animate-pulse"
                        >
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingClasses.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingClasses.map((classItem) => (
                        <div
                          key={classItem.id}
                          className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/teacher/classes/${classItem.id}`)
                          }
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900">
                              {classItem.name}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                              {classItem.time}
                            </span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-600">
                            <GraduationCap className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            <span>{classItem.students} students</span>
                            <span className="mx-2">•</span>
                            <span className="truncate">{classItem.room}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No classes scheduled today</p>
                    </div>
                  )}
                </div>
              </div>

              {stats.attendanceMarked < stats.todayClasses &&
                stats.todayClasses > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-yellow-800">
                          Attendance Reminder
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          You have {stats.todayClasses - stats.attendanceMarked}{" "}
                          class(es) without attendance marked today.
                        </p>
                        <button
                          onClick={() => router.push("/teacher/attendance")}
                          className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
