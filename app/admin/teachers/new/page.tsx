'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddTeacherPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Adding new teacher...', { name, email, subject })
    // TODO: Call API POST /api/admin/teachers
    router.push('/admin/teachers') // go back after save
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Teacher</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg bg-white p-6 shadow rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input 
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Add Teacher
        </button>
      </form>
    </div>
  )
}
