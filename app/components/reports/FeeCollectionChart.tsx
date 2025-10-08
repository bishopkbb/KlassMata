// app/components/reports/FeeCollectionChart.tsx

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign } from 'lucide-react'

interface FeeData {
  month: string
  collected: number
  pending: number
  total: number
}

export function FeeCollectionChart({ data }: { data: FeeData[] }) {
  const formatCurrency = (value: number) => {
    return `₦${(value / 1000).toFixed(0)}K`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Fee Collection Summary
        </h2>
        <p className="text-sm text-gray-600 mt-1">Monthly collection vs pending amounts</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => `₦${value.toLocaleString()}`}
            />
            <Legend />
            <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
