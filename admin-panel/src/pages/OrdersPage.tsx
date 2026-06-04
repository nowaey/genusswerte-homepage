import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { OrderOverview } from '../types'
import { PAYMENT_STATUS_LABELS, FULFILLMENT_STATUS_LABELS } from '../types'

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderOverview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('v_order_overview')
      .select('*')
      .order('ordered_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderOverview[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 style={styles.h1}>Bestellungen</h1>

      {loading ? (
        <p style={styles.loading}>Laden …</p>
      ) : orders.length === 0 ? (
        <p style={styles.empty}>Noch keine Bestellungen vorhanden.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Datum', 'Kunde', 'E-Mail', 'Typ', 'Zahlung', 'Lieferung', 'Betrag', 'Positionen'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.order_id} style={styles.tr}>
                  <td style={styles.td}>{new Date(o.ordered_at).toLocaleDateString('de-DE')}</td>
                  <td style={styles.td}>{o.customer_name}</td>
                  <td style={styles.td}>{o.customer_email}</td>
                  <td style={styles.td}>{o.order_type === 'tasting_voucher' ? 'Gutschein' : 'Genussbox'}</td>
                  <td style={styles.td}>
                    <StatusBadge status={o.payment_status} label={PAYMENT_STATUS_LABELS[o.payment_status]} />
                  </td>
                  <td style={styles.td}>
                    {o.fulfillment_status
                      ? <StatusBadge status={o.fulfillment_status} label={FULFILLMENT_STATUS_LABELS[o.fulfillment_status]} />
                      : <span style={styles.dash}>—</span>}
                  </td>
                  <td style={styles.td}>{Number(o.total_amount).toFixed(2)} €</td>
                  <td style={styles.td}>{o.item_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const color = STATUS_COLORS[status] ?? '#888'
  return (
    <span style={{ ...styles.badge, background: color + '22', color }}>
      {label}
    </span>
  )
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#2d6a2d',
  pending: '#b8860b',
  cancelled: '#c0392b',
  refunded: '#8e44ad',
  completed: '#2d6a2d',
  open: '#b8860b',
  in_progress: '#1a6fa8',
  shipped: '#1a6fa8',
  ready_for_pickup: '#2d6a2d',
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
  badge: { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  dash: { color: '#bbb' },
}
