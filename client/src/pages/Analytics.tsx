import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { analyticsApi } from '@/api/analytics'
import { StatCard } from '@/components/ui/StatCard'
import { AnalyticsCharts } from '@/features/analytics/AnalyticsCharts'
import { Users, BookOpen, TrendingUp } from 'lucide-react'

export default function Analytics() {
  const { data } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.get(),
    staleTime: 60_000,
  })

  const stats = data?.data

  return (
    <>
      <h1 className="section-title" style={{ marginBottom: 20 }}>Analytics &amp; Insights</h1>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <StatCard value={stats?.total_students ?? '—'} label="Total Students" icon={<Users size={22} />} colorClass="indigo" />
        <StatCard value={stats?.course_breakdown.length ?? '—'} label="Unique Courses" icon={<BookOpen size={22} />} colorClass="green" />
        <StatCard value={stats?.recent_count ?? '—'} label="Last 30 Days" icon={<TrendingUp size={22} />} colorClass="amber" />
        <StatCard value={stats?.year_breakdown.length ?? '—'} label="Academic Years" icon={<BarChart3 size={22} />} colorClass="blue" />
      </div>

      <AnalyticsCharts />
    </>
  )
}
