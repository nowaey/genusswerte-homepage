import { useState, FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Genusswerte Bonn</h1>
          <p style={styles.sub}>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Anmelden …' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#f7f4ef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: '40px 36px',
    width: 360,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  header: {
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1a2e1a',
    margin: 0,
  },
  sub: {
    fontSize: 13,
    color: '#888',
    margin: '4px 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#333',
  },
  input: {
    padding: '9px 12px',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  },
  error: {
    fontSize: 13,
    color: '#c0392b',
    margin: 0,
  },
  btn: {
    padding: '10px',
    background: '#1a2e1a',
    color: '#f5f0e8',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 4,
  },
}
