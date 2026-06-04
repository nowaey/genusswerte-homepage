import { useEffect, useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { TastingSlot, TastingType } from '../types'
import { TASTING_LABELS } from '../types'

const TASTING_TYPE_OPTIONS = Object.entries(TASTING_LABELS) as [TastingType, string][]

interface NewSlot {
  tasting_type: TastingType
  slot_date: string
  slot_time: string
  capacity_total: number
  notes: string
}

const EMPTY_SLOT: NewSlot = {
  tasting_type: 'wein_tasting',
  slot_date: '',
  slot_time: '19:00',
  capacity_total: 12,
  notes: '',
}

export function SlotsPage() {
  const [slots, setSlots] = useState<TastingSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewSlot>(EMPTY_SLOT)
  const [saving, setSaving] = useState(false)

  const loadSlots = () => {
    supabase
      .from('tasting_slots')
      .select('*')
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true })
      .then(({ data }) => {
        setSlots((data as TastingSlot[]) ?? [])
        setLoading(false)
      })
  }

  useEffect(loadSlots, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('tasting_slots').insert({
      tasting_type:    form.tasting_type,
      slot_date:       form.slot_date,
      slot_time:       form.slot_time,
      capacity_total:  form.capacity_total,
      notes:           form.notes || null,
    })
    setForm(EMPTY_SLOT)
    setShowForm(false)
    setSaving(false)
    loadSlots()
  }

  const handleCancel = async (slotId: string) => {
    if (!confirm('Termin wirklich absagen?')) return
    await supabase.from('tasting_slots').update({ status: 'cancelled' }).eq('id', slotId)
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'cancelled' } : s))
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.h1}>Tasting-Termine</h1>
        <button onClick={() => setShowForm(v => !v)} style={styles.addBtn}>
          {showForm ? 'Abbrechen' : '+ Neuer Termin'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={styles.form}>
          <h2 style={styles.formTitle}>Neuen Termin anlegen</h2>
          <div style={styles.formGrid}>
            <label style={styles.label}>
              Tasting-Typ
              <select
                value={form.tasting_type}
                onChange={e => setForm(f => ({ ...f, tasting_type: e.target.value as TastingType }))}
                style={styles.select}
                required
              >
                {TASTING_TYPE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Datum
              <input
                type="date"
                value={form.slot_date}
                onChange={e => setForm(f => ({ ...f, slot_date: e.target.value }))}
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              Uhrzeit
              <input
                type="time"
                value={form.slot_time}
                onChange={e => setForm(f => ({ ...f, slot_time: e.target.value }))}
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              Max. Personen
              <input
                type="number"
                value={form.capacity_total}
                onChange={e => setForm(f => ({ ...f, capacity_total: Number(e.target.value) }))}
                style={styles.input}
                min={1}
                required
              />
            </label>
          </div>

          <label style={{ ...styles.label, marginTop: 4 }}>
            Notizen (optional)
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={styles.input}
              placeholder="z. B. besonderes Thema, Hinweise"
            />
          </label>

          <button type="submit" disabled={saving} style={styles.saveBtn}>
            {saving ? 'Speichern …' : 'Termin anlegen'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={styles.loading}>Laden …</p>
      ) : slots.length === 0 ? (
        <p style={styles.empty}>Noch keine Termine angelegt.</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Datum', 'Zeit', 'Tasting', 'Kapazität', 'Reserviert', 'Status', ''].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map(s => (
                <tr key={s.id} style={{ ...styles.tr, opacity: s.status === 'cancelled' ? 0.45 : 1 }}>
                  <td style={styles.td}>{new Date(s.slot_date).toLocaleDateString('de-DE')}</td>
                  <td style={styles.td}>{s.slot_time.slice(0, 5)} Uhr</td>
                  <td style={styles.td}>{TASTING_LABELS[s.tasting_type]}</td>
                  <td style={styles.td}>{s.capacity_total}</td>
                  <td style={styles.td}>
                    <span style={{ color: s.capacity_reserved > 0 ? '#1a2e1a' : '#bbb' }}>
                      {s.capacity_reserved}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...SLOT_STATUS_STYLE[s.status] }}>
                      {s.status === 'active' ? 'Aktiv' : s.status === 'full' ? 'Ausgebucht' : 'Abgesagt'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {s.status === 'active' && (
                      <button onClick={() => handleCancel(s.id)} style={styles.cancelBtn}>
                        Absagen
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

const SLOT_STATUS_STYLE: Record<string, React.CSSProperties> = {
  active:    { background: '#e8f5e9', color: '#2d6a2d' },
  full:      { background: '#fff3e0', color: '#b8860b' },
  cancelled: { background: '#fdecea', color: '#c0392b' },
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  h1: { fontSize: 22, fontWeight: 600, color: '#1a2e1a', margin: 0 },
  addBtn: {
    padding: '8px 16px', background: '#1a2e1a', color: '#f5f0e8',
    border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  },
  form: {
    background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12,
  },
  formTitle: { fontSize: 15, fontWeight: 600, color: '#1a2e1a', margin: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  label: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, fontWeight: 500, color: '#333' },
  input: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 5, fontSize: 13 },
  select: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 5, fontSize: 13 },
  saveBtn: {
    alignSelf: 'flex-start', padding: '9px 18px', background: '#1a2e1a', color: '#f5f0e8',
    border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
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
  td: { padding: '10px 12px', verticalAlign: 'middle', whiteSpace: 'nowrap' },
  badge: { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 },
  cancelBtn: {
    padding: '4px 10px', background: 'transparent', color: '#c0392b',
    border: '1px solid #c0392b', borderRadius: 4, fontSize: 12, cursor: 'pointer',
  },
}
