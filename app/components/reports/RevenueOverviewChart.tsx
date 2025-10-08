// app/components/reports/RevenueOverviewChart.tsx

'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface FeeData {
  month: string
  collected: number
  pending: number
  total: number
}

export function RevenueOverviewChart({ data }: { data: FeeData[] }) {
  const formatCurrency = (value: number) => {
    return `₦${(value / 1000).toFixed(0)}K`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Revenue Trends
        </h2>
        <p className="text-sm text-gray-600 mt-1">Monthly revenue growth analysis</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
            <Area 
              type="monotone" 
              dataKey="collected" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCollected)"
              name="Revenue Collected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}