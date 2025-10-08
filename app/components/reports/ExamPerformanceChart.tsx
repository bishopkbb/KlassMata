// app/components/reports/ExamPerformanceChart.tsx

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface ExamData {
  examName: string
  subject: string
  average: number
  highest: number
  lowest: number
  passRate: number
}

export function ExamPerformanceChart({ data }: { data: ExamData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          Exam Performance Overview
        </h2>
        <p className="text-sm text-gray-600 mt-1">Average scores and performance metrics</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="subject" 
              tick={{ fontSize: 12 }}
            />
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
            <Bar dataKey="average" fill="#8b5cf6" name="Average Score" radius={[8, 8, 0, 0]} />
            <Bar dataKey="highest" fill="#10b981" name="Highest Score" radius={[8, 8, 0, 0]} />
            <Bar dataKey="lowest" fill="#ef4444" name="Lowest Score" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


