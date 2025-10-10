// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Plus,
  LogOut,
  Home,
  FileText,
  BarChart,
  MessageSquare,
  ChevronRight,
  Clock,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

interface SchoolStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  pendingPayments: number;
  todayAttendance: number;
}

interface Subscription {
  planName: string;
  status: string;
  endDate: string;
  daysRemaining?: number;
  features: { maxStudents: number; currentStudents: number };
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolStats, setSchoolStats] = useState<SchoolStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    pendingPayments: 0,
    todayAttendance: 0,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const statsRes = await fetch("/api/admin/dashboard/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setSchoolStats(statsData.stats);
          setSchoolName(statsData.schoolName);
        }
        const subRes = await fetch("/api/admin/dashboard/subscriptions");
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData);
        }
        const actRes = await fetch("/api/admin/dashboard/activities");
        if (actRes.ok) {
          const actData = await actRes.json();
          setRecentActivities(actData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) fetchDashboardData();
  }, [session]);

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/admin/dashboard", active: true },
    { icon: Users, label: "Teachers", href: "/admin/teachers" },
    { icon: GraduationCap, label: "Students", href: "/admin/students" },
    { icon: BookOpen, label: "Classes", href: "/admin/classes" },
    { icon: Calendar, label: "Attendance", href: "/admin/attendance" },
    { icon: FileText, label: "Assignments", href: "/admin/assignments" },
    { icon: CreditCard, label: "Payments", href: "/admin/payments" },
    { icon: BarChart, label: "Reports", href: "/admin/reports" },
    {
      icon: MessageSquare,
      label: "Communication",
      href: "/admin/communication",
    },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const stats = [
    {
      title: "Teachers",
      value: schoolStats.totalTeachers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/teachers",
    },
    {
      title: "Students",
      value: schoolStats.totalStudents,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/admin/students",
    },
    {
      title: "Classes",
      value: schoolStats.totalClasses,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/admin/classes",
    },
    {
      title: "Subjects",
      value: schoolStats.totalSubjects,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/admin/classes",
    },
  ];

  const quickActions = [
    {
      title: "Add New Teacher",
      description: "Invite and register teachers",
      icon: Plus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: () => router.push("/admin/teachers"),
    },
    {
      title: "Enroll Student",
      description: "Register new students",
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: () => router.push("/admin/students"),
    },
    {
      title: "Mark Attendance",
      description: "Record today's attendance",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      action: () => router.push("/admin/attendance"),
    },
    {
      title: "View Reports",
      description: "Generate performance reports",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      action: () => router.push("/admin/reports"),
    },
  ];

  const getActivityIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case "teacher":
        return <Users className={`${iconClass} text-blue-500`} />;
      case "student":
        return <GraduationCap className={`${iconClass} text-purple-500`} />;
      case "class":
        return <BookOpen className={`${iconClass} text-green-500`} />;
      case "payment":
        return <CreditCard className={`${iconClass} text-orange-500`} />;
      case "attendance":
        return <Calendar className={`${iconClass} text-indigo-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case "trial":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            {schoolName && (
              <div className="text-center">
                <p className="text-sm text-white/70 truncate">{schoolName}</p>
              </div>
            )}
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Welcome back, {session?.user?.firstName || "Admin"}
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm md:text-lg">
                  {session?.user?.firstName?.[0] || "A"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">
                  {session?.user?.firstName} {session?.user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {subscription?.status === "trial" &&
            subscription.daysRemaining &&
            subscription.daysRemaining <= 7 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-0 sm:mr-3 mb-2 sm:mb-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Trial Ending Soon
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your trial expires in {subscription.daysRemaining} days.
                      Upgrade now to continue using all features.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/admin/settings")}
                    className="mt-3 sm:mt-0 sm:ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium w-full sm:w-auto"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

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
              : stats.map((stat) => {
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
            {/* Left Column */}
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
                              <span className="truncate">{activity.user}</span>
                              <span className="mx-2">•</span>
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
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
                {recentActivities.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <button className="w-full text-sm text-center text-emerald-700 hover:text-emerald-800 font-medium">
                      View all activities
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 md:space-y-6">
              {/* Subscription Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Subscription
                  </h2>
                </div>
                <div className="p-4 md:p-6">
                  {loading || !subscription ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full mb-4">
                        <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                      </div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getSubscriptionColor(subscription.status)}`}
                      >
                        {subscription.status === "trial"
                          ? "Trial Active"
                          : subscription.planName}
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                        {subscription.planName} Plan
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-4">
                        {subscription.status === "trial" &&
                        subscription.daysRemaining
                          ? `${subscription.daysRemaining} days remaining`
                          : `Renews ${subscription.endDate}`}
                      </p>

                      {subscription.features && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs md:text-sm text-gray-700 mb-1">
                            Students: {subscription.features.currentStudents} /{" "}
                            {subscription.features.maxStudents}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(subscription.features.currentStudents / subscription.features.maxStudents) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <button
                          onClick={() => router.push("/admin/settings")}
                          className="w-full px-4 py-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors font-medium text-sm"
                        >
                          {subscription.status === "trial"
                            ? "Upgrade Plan"
                            : "Manage Subscription"}
                        </button>
                        <button
                          onClick={() => router.push("/admin/payments")}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                          Billing History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Pending Actions
                  </h2>
                </div>
                <div className="p-4 md:p-6 space-y-3">
                  {schoolStats.pendingPayments > 0 && (
                    <button
                      onClick={() => router.push("/admin/payments")}
                      className="w-full p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mr-2" />
                          <span className="text-xs md:text-sm font-medium text-gray-900">
                            Pending Payments
                          </span>
                        </div>
                        <span className="text-base md:text-lg font-bold text-orange-600">
                          {schoolStats.pendingPayments}
                        </span>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => router.push("/admin/attendance")}
                    className="w-full p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2" />
                        <span className="text-xs md:text-sm font-medium text-gray-900">
                          Today&apos;s Attendance
                        </span>
                      </div>
                      <span className="text-base md:text-lg font-bold text-blue-600">
                        {schoolStats.todayAttendance}%
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
