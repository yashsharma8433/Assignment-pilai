import { LogsTable } from '@/features/logs/LogsTable'

export default function Logs() {
  return (
    <>
      <h1 className="section-title" style={{ marginBottom: 4 }}>Activity Log</h1>
      <p className="section-sub" style={{ marginBottom: 20 }}>
        Audit trail of all student record changes — creates, updates, and deletes.
      </p>
      <LogsTable />
    </>
  )
}
