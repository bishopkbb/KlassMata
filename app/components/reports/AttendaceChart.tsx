// app/components/reports/AttendanceChart.tsx

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar } from 'lucide-react'

interface AttendanceData {
  className: string
  present: number
  absent: number
  late: number
  total: number
  rate: number
}

export function AttendanceChart({ data }: { data: AttendanceData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          Attendance Summary by Class
        </h2>
        <p className="text-sm text-gray-600 mt-1">Showing attendance breakdown for all classes</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="className" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="present" fill="#10b981" name="Present" radius={[8, 8, 0, 0]} />
            <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[8, 8, 0, 0]} />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}



