import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, UserPlus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '@/api/analytics'
import { StatCard } from '@/components/ui/StatCard'
import { AnalyticsCharts } from '@/features/analytics/AnalyticsCharts'

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.get(),
    staleTime: 60_000,
  })

  const stats = data?.data

  return (
    <>
      <div className="section-header">
        <div>
          <div className="section-title">Welcome back 👋</div>
          <div className="section-sub">Here's what's happening with your students today.</div>
        </div>
        <Link to="/students" className="btn btn-primary">
          <UserPlus size={16} />
          Add Student
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard
          value={stats?.total_students ?? '—'}
          label="Total Students"
          icon={<Users size={22} />}
          colorClass="indigo"
        />
        <StatCard
          value={stats?.course_breakdown.length ?? '—'}
          label="Active Courses"
          icon={<BookOpen size={22} />}
          colorClass="green"
        />
        <StatCard
          value={stats?.recent_count ?? '—'}
          label="New This Month"
          icon={<TrendingUp size={22} />}
          colorClass="amber"
        />
        <StatCard
          value={stats?.gender_breakdown.length ?? '—'}
          label="Gender Categories"
          icon={<Users size={22} />}
          colorClass="blue"
        />
      </div>

      {/* Charts */}
      <div className="card" style={{ padding: 0, marginTop: 8 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Analytics Overview</h2>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <AnalyticsCharts />
        </div>
      </div>
    </>
  )
}
