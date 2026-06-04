import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { voucher_code } = await req.json()

    if (!voucher_code || typeof voucher_code !== 'string') {
      return json({ error: 'INVALID_REQUEST' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Voucher laden um tasting_type und persons zu kennen
    const { data: voucher, error: vErr } = await supabase
      .from('vouchers')
      .select('tasting_type, persons, status')
      .eq('voucher_code', voucher_code.trim().toUpperCase())
      .maybeSingle()

    if (vErr) throw vErr

    if (!voucher) {
      return json({ error: 'VOUCHER_NOT_FOUND' }, 404)
    }

    if (voucher.status !== 'active') {
      return json({ error: 'VOUCHER_NOT_ACTIVE' }, 400)
    }

    // Aktive Slots mit ausreichend Kapazität für zukünftige Daten
    const today = new Date().toISOString().split('T')[0]

    const { data: slots, error: sErr } = await supabase
      .from('tasting_slots')
      .select('id, slot_date, slot_time, capacity_total, capacity_reserved, notes')
      .eq('tasting_type', voucher.tasting_type)
      .eq('status', 'active')
      .gte('slot_date', today)
      .order('slot_date', { ascending: true })
      .order('slot_time', { ascending: true })

    if (sErr) throw sErr

    // Nur Slots mit genug freier Kapazität zurückgeben
    const available = (slots ?? []).filter(
      (s) => s.capacity_total - s.capacity_reserved >= voucher.persons,
    ).map((s) => ({
      id: s.id,
      date: s.slot_date,
      time: s.slot_time,
      available_spots: s.capacity_total - s.capacity_reserved,
      notes: s.notes ?? null,
    }))

    return json({ slots: available })
  } catch (err) {
    console.error('get-available-slots error:', err)
    return json({ error: 'INTERNAL_ERROR' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
