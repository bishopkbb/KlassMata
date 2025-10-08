// app/components/reports/AssignmentCompletionChart.tsx

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { FileText } from 'lucide-react'

interface AssignmentData {
  subject: string
  submitted: number
  pending: number
  total: number
  rate: number
}

export function AssignmentCompletionChart({ data }: { data: AssignmentData[] }) {
  const getColor = (rate: number) => {
    if (rate >= 90) return '#10b981'
    if (rate >= 75) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Assignment Completion Rate
        </h2>
        <p className="text-sm text-gray-600 mt-1">Submission status across all subjects</p>
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
              label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'rate') return [`${value.toFixed(1)}%`, 'Completion Rate']
                return [value, name]
              }}
            />
            <Legend />
            <Bar dataKey="rate" name="Completion Rate" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
