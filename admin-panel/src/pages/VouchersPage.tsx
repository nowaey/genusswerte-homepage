import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { VoucherOverview } from '../types'
import { TASTING_LABELS, VOUCHER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../types'

export function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    supabase
      .from('v_voucher_overview')
      .select('*')
      .order('voucher_created_at', { ascending: false })
      .then(({ data }) => {
        setVouchers((data as VoucherOverview[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? vouchers : vouchers.filter(v => v.voucher_status === filter)

  const handleCheckin = async (voucherId: string) => {
    await supabase
      .from('vouchers')
      .update({ status: 'checked_in' })
      .eq('id', voucherId)
    setVouchers(prev =>
      prev.map(v => v.voucher_id === voucherId ? { ...v, voucher_status: 'checked_in' } : v)
    )
  }

  return (
    <div>
      <h1 style={styles.h1}>Gutscheine</h1>

      <div style={styles.filters}>
        {(['all', 'active', 'scheduled', 'checked_in', 'cancelled', 'expired'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{ ...styles.filterBtn, ...(filter === s ? styles.filterBtnActive : {}) }}
          >
            {s === 'all' ? 'Alle' : VOUCHER_STATUS_LABELS[s]}
            {s !== 'all' && (
              <span style={styles.count}>
                {vouchers.filter(v => v.voucher_status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.loading}>Laden …</p>
      ) : filtered.length === 0 ? (
        <p style={styles.empty}>Keine Gutscheine in dieser Kategorie.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Code', 'Tasting', 'Personen', 'Status', 'Zahlung', 'Kunde', 'Gültig bis', 'Termin', ''].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.voucher_id} style={styles.tr}>
                  <td style={styles.td}>
                    <code style={styles.code}>{v.voucher_code}</code>
                  </td>
                  <td style={styles.td}>{TASTING_LABELS[v.tasting_type]}</td>
                  <td style={styles.td}>{v.persons}</td>
                  <td style={styles.td}>
                    <StatusBadge status={v.voucher_status} label={VOUCHER_STATUS_LABELS[v.voucher_status]} />
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={v.payment_status} label={PAYMENT_STATUS_LABELS[v.payment_status]} />
                  </td>
                  <td style={styles.td}>
                    <div>{v.customer_name}</div>
                    <div style={styles.sub}>{v.customer_email}</div>
                  </td>
                  <td style={styles.td}>
                    {v.valid_until
                      ? new Date(v.valid_until).toLocaleDateString('de-DE')
                      : <span style={styles.dash}>—</span>}
                  </td>
                  <td style={styles.td}>
                    {v.has_reservation && v.slot_id
                      ? <span style={styles.hasSlot}>Termin vorhanden</span>
                      : <span style={styles.dash}>—</span>}
                  </td>
                  <td style={styles.td}>
                    {v.voucher_status === 'scheduled' && (
                      <button
                        onClick={() => handleCheckin(v.voucher_id)}
                        style={styles.checkinBtn}
                      >
                        Check-in
                      </button>
                    )}
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

function StatusBadge({ status, label }: { status: string; label: string }) {
  const color = STATUS_COLORS[status] ?? '#888'
  return (
    <span style={{ ...styles.badge, background: color + '22', color }}>
      {label}
    </span>
  )
}

const STATUS_COLORS: Record<string, string> = {
  active: '#1a6fa8',
  scheduled: '#2d6a2d',
  checked_in: '#2d6a2d',
  cancelled: '#c0392b',
  expired: '#888',
  paid: '#2d6a2d',
  pending: '#b8860b',
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: 22, fontWeight: 600, color: '#1a2e1a', marginBottom: 20 },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6,
    background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center',
  },
  filterBtnActive: { background: '#1a2e1a', color: '#f5f0e8', border: '1px solid #1a2e1a' },
  count: {
    background: 'rgba(0,0,0,0.12)', borderRadius: 10, padding: '0 6px',
    fontSize: 11, fontWeight: 600,
  },
  loading: { color: '#888', fontSize: 14 },
  empty: { color: '#888', fontSize: 14 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '10px 12px', background: '#f0ede8',
    color: '#555', fontWeight: 600, whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '10px 12px', verticalAlign: 'middle' },
  code: { fontFamily: 'monospace', fontSize: 12, background: '#f0ede8', padding: '2px 6px', borderRadius: 3 },
  badge: { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  sub: { fontSize: 11, color: '#888', marginTop: 2 },
  dash: { color: '#bbb' },
  hasSlot: { fontSize: 12, color: '#2d6a2d' },
  checkinBtn: {
    padding: '4px 10px', background: '#1a2e1a', color: '#f5f0e8',
    border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer',
  },
}
