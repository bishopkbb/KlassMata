"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ManageClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", teacherId: "" });
  const [editingClass, setEditingClass] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);

    fetch("/api/teachers")
      .then((res) => res.json())
      .then(setTeachers);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update class
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingClass ? "PUT" : "POST";
    const url = editingClass
      ? `/api/classes/${editingClass.id}`
      : "/api/classes";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updatedClass = await res.json();
      if (editingClass) {
        setClasses((prev) =>
          prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
        );
        toast.success("Class updated!");
      } else {
        setClasses([...classes, updatedClass]);
        toast.success("Class added!");
      }
      setForm({ name: "", teacherId: "" });
      setEditingClass(null);
    } else {
      toast.error("Failed to save class.");
    }
  };

  // Delete class
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });

    if (res.ok) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Class deleted!");
    } else {
      toast.error("Failed to delete class.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Classes</h1>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Class Name"
          value={form.name}
          onChange={handleChange}
          className="border rounded p-2 w-full"
          required
        />

        <select
          name="teacherId"
          value={form.teacherId}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Assign Teacher --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-emerald-900 text-white px-4 py-2 rounded"
        >
          {editingClass ? "Update Class" : "Add Class"}
        </button>

        {editingClass && (
          <button
            type="button"
            onClick={() => {
              setEditingClass(null);
              setForm({ name: "", teacherId: "" });
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Class List */}
      <div className="space-y-4 mt-4">
        {classes.map((c) => (
          <div
            key={c.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-600">
                Teacher: {c.teacher?.name || "Unassigned"}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditingClass(c);
                  setForm({
                    name: c.name,
                    teacherId: c.teacherId || "",
                  });
                }}
                className="bg-emerald-900 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Back to Dashboard */}
      <button
        onClick={() => router.push("/admin/dashboard")}
        className="mt-6 bg-emerald-900 text-white px-4 py-2 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
