// app/components/reports/SubscriptionUsageChart.tsx

'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'

export function SubscriptionUsageChart({ 
  current, 
  limit, 
  usage 
}: { 
  current: number
  limit: number
  usage: number
}) {
  const data = [
    { name: 'Used', value: current, color: '#3b82f6' },
    { name: 'Available', value: limit - current, color: '#e5e7eb' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <PieIcon className="w-5 h-5 mr-2 text-purple-600" />
          Subscription Usage
        </h2>
        <p className="text-sm text-gray-600 mt-1">Current plan capacity utilization</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Students Enrolled</p>
              <p className="text-3xl font-bold text-blue-600">{current}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Plan Capacity</p>
              <p className="text-3xl font-bold text-gray-900">{limit}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Usage Percentage</p>
              <p className="text-3xl font-bold text-purple-600">{usage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
