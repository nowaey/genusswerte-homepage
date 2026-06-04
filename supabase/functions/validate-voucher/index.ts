import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { voucher_code } = await req.json()

    if (!voucher_code || typeof voucher_code !== 'string') {
      return json({ valid: false, error: 'INVALID_REQUEST' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase
      .from('vouchers')
      .select('id, voucher_code, tasting_type, persons, status, valid_until')
      .eq('voucher_code', voucher_code.trim().toUpperCase())
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return json({ valid: false, error: 'VOUCHER_NOT_FOUND' })
    }

    if (data.status === 'expired' || (data.valid_until && new Date(data.valid_until) < new Date())) {
      return json({ valid: false, error: 'VOUCHER_EXPIRED' })
    }

    if (data.status === 'scheduled') {
      return json({ valid: false, error: 'VOUCHER_ALREADY_RESERVED' })
    }

    if (data.status === 'checked_in') {
      return json({ valid: false, error: 'VOUCHER_ALREADY_USED' })
    }

    if (data.status === 'cancelled') {
      return json({ valid: false, error: 'VOUCHER_CANCELLED' })
    }

    if (data.status !== 'active') {
      return json({ valid: false, error: 'VOUCHER_INVALID' })
    }

    return json({
      valid: true,
      voucher_code: data.voucher_code,
      tasting_type: data.tasting_type,
      persons: data.persons,
      valid_until: data.valid_until,
    })
  } catch (err) {
    console.error('validate-voucher error:', err)
    return json({ valid: false, error: 'INTERNAL_ERROR' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
