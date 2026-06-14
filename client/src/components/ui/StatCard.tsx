import type { ReactNode } from 'react'

interface StatCardProps {
  value: number | string
  label: string
  icon: ReactNode
  colorClass: 'indigo' | 'green' | 'amber' | 'blue'
}

export function StatCard({ value, label, icon, colorClass }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrap ${colorClass}`}>{icon}</div>
      <div>
        <div className="stat-value">{value.toLocaleString()}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
