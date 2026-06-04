import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ScheduleBody {
  voucher_code: string
  slot_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: ScheduleBody = await req.json()

    const { voucher_code, slot_id, customer_name, customer_email } = body

    if (!voucher_code || !slot_id || !customer_name || !customer_email) {
      return json({ success: false, error: 'MISSING_FIELDS' }, 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return json({ success: false, error: 'INVALID_EMAIL' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Atomare Reservierung über die DB-Funktion — alle Locks und Checks dort
    const { data, error } = await supabase.rpc('reserve_voucher_slot', {
      p_voucher_code: voucher_code.trim().toUpperCase(),
      p_slot_id: slot_id,
      p_customer_name: customer_name.trim(),
      p_customer_email: customer_email.trim().toLowerCase(),
      p_customer_phone: body.customer_phone?.trim() ?? null,
      p_customer_address: null,
      p_notes: null,
    })

    if (error) throw error

    const result = data as {
      success: boolean
      error?: string
      reservation_id?: string
      slot_date?: string
      slot_time?: string
      voucher_code?: string
    }

    if (!result.success) {
      const statusMap: Record<string, number> = {
        VOUCHER_NOT_FOUND: 404,
        SLOT_NOT_FOUND: 404,
        VOUCHER_NOT_ACTIVE: 400,
        VOUCHER_EXPIRED: 400,
        VOUCHER_ALREADY_RESERVED: 409,
        VOUCHER_CANCELLED: 400,
        SLOT_NOT_ACTIVE: 400,
        SLOT_TYPE_MISMATCH: 400,
        SLOT_NO_CAPACITY: 409,
      }
      const status = result.error ? (statusMap[result.error] ?? 400) : 400
      return json({ success: false, error: result.error }, status)
    }

    return json({
      success: true,
      reservation_id: result.reservation_id,
      slot_date: result.slot_date,
      slot_time: result.slot_time,
      voucher_code: result.voucher_code,
    })
  } catch (err) {
    console.error('schedule-voucher error:', err)
    return json({ success: false, error: 'INTERNAL_ERROR' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
