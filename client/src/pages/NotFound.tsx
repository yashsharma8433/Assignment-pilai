import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  )
}
