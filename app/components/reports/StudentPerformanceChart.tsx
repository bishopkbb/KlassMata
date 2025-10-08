// app/components/reports/StudentPerformanceChart.tsx

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users } from 'lucide-react'

interface PerformanceData {
  grade: string
  average: number
  passRate: number
  studentCount: number
}

export function StudentPerformanceChart({ data }: { data: PerformanceData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Student Performance by Grade
        </h2>
        <p className="text-sm text-gray-600 mt-1">Average scores and pass rates across grades</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend />
            <Bar dataKey="average" fill="#3b82f6" name="Average Score" radius={[8, 8, 0, 0]} />
            <Bar dataKey="passRate" fill="#10b981" name="Pass Rate" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}