import { NavLink } from 'react-router-dom'
import { useAuth } from '../../store/auth'

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard' },
  { to: '/orders',       label: 'Bestellungen' },
  { to: '/vouchers',     label: 'Gutscheine' },
  { to: '/slots',        label: 'Tasting-Termine' },
  { to: '/reservations', label: 'Reservierungen' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside style={styles.aside}>
      <div style={styles.brand}>
        <span style={styles.brandName}>Genusswerte</span>
        <span style={styles.brandSub}>Admin Panel</span>
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <span style={styles.userEmail}>{user?.email}</span>
        <button onClick={signOut} style={styles.signOutBtn}>
          Abmelden
        </button>
      </div>
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  aside: {
    width: 220,
    minHeight: '100vh',
    background: '#1a2e1a',
    color: '#f5f0e8',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
  },
  brand: {
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  brandName: {
    display: 'block',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
  brandSub: {
    display: 'block',
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 12px',
  },
  link: {
    display: 'block',
    padding: '9px 12px',
    borderRadius: 6,
    color: 'rgba(245,240,232,0.7)',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'background 0.15s, color 0.15s',
  },
  linkActive: {
    background: 'rgba(255,255,255,0.1)',
    color: '#f5f0e8',
  },
  footer: {
    padding: '16px 20px 0',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginTop: 16,
  },
  userEmail: {
    display: 'block',
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  signOutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(245,240,232,0.7)',
    borderRadius: 5,
    padding: '6px 12px',
    fontSize: 13,
    cursor: 'pointer',
    width: '100%',
  },
}
