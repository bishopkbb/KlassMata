// app/admin/teachers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import InviteTeacherButton from "@/components/InviteTeacherButton";
import PendingInvites from "@/components/PendingInvites"; // Add this import
import Link from "next/link";
import {
  Users,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  avatar?: string;
  joinedAt?: string;
}

export default function TeachersPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teachers");

      if (res.status === 401) {
        toast.error("Please log in to view teachers");
        router.push("/auth/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      } else {
        toast.error("Failed to fetch teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });

      if (res.ok) {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        toast.success("Teacher deleted successfully!");
      } else {
        toast.error("Failed to delete teacher");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-[#024731] hover:text-[#035a3d] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
              <p className="text-gray-600 mt-1">Manage your teaching staff</p>
            </div>
            <InviteTeacherButton />
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teachers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#024731] focus:border-transparent"
            />
          </div>
        </div>

        {/* Add Pending Invites component here */}
        <PendingInvites />

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Teachers ({filteredTeachers.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024731] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No teachers found</p>
              <p className="text-sm text-gray-500 mt-2">
                Click {"Invite Teacher"} to add your first teacher
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#024731] bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-[#024731] font-semibold">
                              {teacher.name.charAt(0)}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900">
                            {teacher.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {teacher.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {teacher.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {teacher.joinedAt
                          ? new Date(teacher.joinedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/teachers/${teacher.id}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete teacher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
