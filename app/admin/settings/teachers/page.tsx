"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Toast from "@radix-ui/react-toast";

export default function ManageTeachersPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", subject: "Mathematics", class: "Grade 5" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", subject: "English", class: "Grade 6" },
  ]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const deleteTeacher = (id: number) => {
    const teacher = teachers.find((t) => t.id === id);
    setTeachers(teachers.filter((t) => t.id !== id));
    setToastMessage(`Teacher ${teacher?.name} deleted successfully!`);
    setToastOpen(true);
  };

  const reassignTeacher = (id: number, newClass: string) => {
    const updated = teachers.map((t) =>
      t.id === id ? { ...t, class: newClass } : t
    );
    setTeachers(updated);

    const teacher = teachers.find((t) => t.id === id);
    setToastMessage(`Teacher ${teacher?.name} reassigned to ${newClass}!`);
    setToastOpen(true);
  };

  return (
    <Toast.Provider swipeDirection="right">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Teachers</h1>

        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="p-2 border">{teacher.name}</td>
                  <td className="p-2 border">{teacher.email}</td>
                  <td className="p-2 border">{teacher.subject}</td>
                  <td className="p-2 border">{teacher.class}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => deleteTeacher(teacher.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        reassignTeacher(teacher.id, teacher.class === "Grade 5" ? "Grade 6" : "Grade 5")
                      }
                      className="bg-emerald-900 text-white px-3 py-1 rounded hover:bg-emerald-800"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="bg-emerald-900 text-white px-4 py-2 rounded hover:bg-emerald-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast.Root
        className="bg-emerald-900 text-white px-4 py-2 rounded shadow-lg"
        open={toastOpen}
        onOpenChange={setToastOpen}
      >
        <Toast.Title className="font-semibold">Action Successful</Toast.Title>
        <Toast.Description>{toastMessage}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-4 right-4 w-80 max-w-full z-50" />
    </Toast.Provider>
  );
}
