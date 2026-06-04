import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ReservationOverview } from '../types'
import { TASTING_LABELS, VOUCHER_STATUS_LABELS } from '../types'

export function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationOverview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('v_reservation_overview')
      .select('*')
      .then(({ data }) => {
        setReservations((data as ReservationOverview[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 style={styles.h1}>Reservierungen</h1>

      {loading ? (
        <p style={styles.loading}>Laden …</p>
      ) : reservations.length === 0 ? (
        <p style={styles.empty}>Noch keine Reservierungen vorhanden.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Termin', 'Zeit', 'Tasting', 'Code', 'Personen', 'Name', 'E-Mail', 'Telefon', 'Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.reservation_id} style={styles.tr}>
                  <td style={styles.td}>{new Date(r.slot_date).toLocaleDateString('de-DE')}</td>
                  <td style={styles.td}>{r.slot_time.slice(0, 5)} Uhr</td>
                  <td style={styles.td}>{TASTING_LABELS[r.tasting_type]}</td>
                  <td style={styles.td}>
                    <code style={styles.code}>{r.voucher_code}</code>
                  </td>
                  <td style={styles.td}>{r.persons}</td>
                  <td style={styles.td}>{r.customer_name}</td>
                  <td style={styles.td}>{r.customer_email}</td>
                  <td style={styles.td}>{r.customer_phone ?? <span style={styles.dash}>—</span>}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...STATUS_STYLE[r.voucher_status] }}>
                      {VOUCHER_STATUS_LABELS[r.voucher_status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  scheduled:  { background: '#e8f5e9', color: '#2d6a2d' },
  checked_in: { background: '#e3f0ff', color: '#1a6fa8' },
  cancelled:  { background: '#fdecea', color: '#c0392b' },
  active:     { background: '#fff3e0', color: '#b8860b' },
  expired:    { background: '#f5f5f5', color: '#888' },
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 22, fontWeight: 600, color: '#1a2e1a', marginBottom: 24 },
  loading: { color: '#888', fontSize: 14 },
  empty: { color: '#888', fontSize: 14 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '10px 12px', background: '#f0ede8',
    color: '#555', fontWeight: 600, whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '10px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' },
  code: { fontFamily: 'monospace', fontSize: 12, background: '#f0ede8', padding: '2px 6px', borderRadius: 3 },
  badge: { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  dash: { color: '#bbb' },
}
