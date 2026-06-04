import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Stats {
  ordersTotal: number
  ordersPaid: number
  vouchersActive: number
  vouchersScheduled: number
  slotsActive: number
  reservationsTotal: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [orders, vouchers, slots, reservations] = await Promise.all([
        supabase.from('orders').select('payment_status'),
        supabase.from('vouchers').select('status'),
        supabase.from('tasting_slots').select('status'),
        supabase.from('voucher_reservations').select('id'),
      ])

      const o = orders.data ?? []
      const v = vouchers.data ?? []
      const s = slots.data ?? []

      setStats({
        ordersTotal:         o.length,
        ordersPaid:          o.filter(x => x.payment_status === 'paid').length,
        vouchersActive:      v.filter(x => x.status === 'active').length,
        vouchersScheduled:   v.filter(x => x.status === 'scheduled').length,
        slotsActive:         s.filter(x => x.status === 'active').length,
        reservationsTotal:   reservations.data?.length ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h1 style={styles.h1}>Dashboard</h1>

      {loading ? (
        <p style={styles.loading}>Laden …</p>
      ) : stats ? (
        <div style={styles.grid}>
          <StatCard label="Bestellungen gesamt"   value={stats.ordersTotal} />
          <StatCard label="Davon bezahlt"          value={stats.ordersPaid} accent />
          <StatCard label="Gutscheine aktiv"       value={stats.vouchersActive} />
          <StatCard label="Gutscheine mit Termin"  value={stats.vouchersScheduled} />
          <StatCard label="Aktive Termine"         value={stats.slotsActive} />
          <StatCard label="Reservierungen"         value={stats.reservationsTotal} />
        </div>
      ) : null}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ ...styles.card, ...(accent ? styles.cardAccent : {}) }}>
      <span style={styles.cardValue}>{value}</span>
      <span style={styles.cardLabel}>{label}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  h1: {
    fontSize: 22,
    fontWeight: 600,
    color: '#1a2e1a',
    marginBottom: 24,
  },
  loading: {
    color: '#888',
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardAccent: {
    borderLeft: '3px solid #1a2e1a',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a2e1a',
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
  },
}
