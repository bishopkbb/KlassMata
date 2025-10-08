// app/components/reports/PerformanceTrendChart.tsx

'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

export function PerformanceTrendChart({ period }: { period: string }) {
  const data = [
    { month: 'Week 1', attendance: 92, assignments: 85, exams: 78 },
    { month: 'Week 2', attendance: 94, assignments: 88, exams: 80 },
    { month: 'Week 3', attendance: 91, assignments: 86, exams: 82 },
    { month: 'Week 4', attendance: 95, assignments: 90, exams: 85 },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
          Performance Trends
        </h2>
        <p className="text-sm text-gray-600 mt-1">Weekly performance metrics</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="attendance" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Attendance %"
              dot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="assignments" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Assignments %"
              dot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="exams" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Exam Average %"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}







