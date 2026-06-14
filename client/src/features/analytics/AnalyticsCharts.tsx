import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { analyticsApi } from '@/api/analytics'

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

export function AnalyticsCharts() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.get(),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="charts-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="chart-card">
            <div className="skeleton" style={{ height: 240 }} />
          </div>
        ))}
      </div>
    )
  }

  const analytics = data?.data
  if (!analytics) return null

  return (
    <div className="charts-grid">
      {/* Course breakdown bar chart */}
      <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
        <div className="chart-title">Enrollment by Course</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={analytics.course_breakdown} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="course" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#181b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gender pie chart */}
      <div className="chart-card">
        <div className="chart-title">Gender Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={analytics.gender_breakdown}
              dataKey="count"
              nameKey="gender"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ gender, percent }) => `${gender} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            >
              {analytics.gender_breakdown.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#181b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Year breakdown bar chart */}
      <div className="chart-card">
        <div className="chart-title">Year-wise Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={analytics.year_breakdown} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tickFormatter={(v) => `Year ${v}`} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#181b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
              {analytics.year_breakdown.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly enrollment line chart */}
      {analytics.monthly_enrollment.length > 0 && (
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-title">Monthly Enrollment Trend (Last 12 Months)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.monthly_enrollment} margin={{ top: 0, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#181b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6, fill: '#a855f7' }}
                name="Enrolled"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
