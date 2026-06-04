import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TASTING_LABELS: Record<string, string> = {
  wein_tasting:                  'Wein Tasting',
  afterwork_wein_tasting:        'Afterwork Wein Tasting',
  gin_tasting:                   'Gin Tasting',
  champagner_popcorn_tasting:    'Champagner & Popcorn',
  trueffel_champagner_tasting:   'Trüffel & Champagner',
  whisky_tasting:                'Whisky Tasting',
  craft_beer_tasting:            'Craft Beer Tasting',
  wagyu_wein_champagner_tasting: 'Wagyu, Wein & Champagner',
  apero_antipasti_tasting:       'Apéro & Antipasti',
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const rawBody = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  // Stripe-Signatur manuell prüfen (kein SDK nötig)
  const valid = await verifyStripeSignature(rawBody, signature, webhookSecret)
  if (!valid) {
    console.error('Invalid Stripe signature')
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(rawBody)

  if (event.type !== 'checkout.session.completed') {
    return new Response('ok', { status: 200 })
  }

  const session = event.data.object
  const tastingType: string = session.metadata?.tasting_type
  const persons: number = parseInt(session.metadata?.persons ?? '0', 10)

  if (!tastingType || !persons) {
    console.error('Missing metadata in session:', session.id)
    return new Response('ok', { status: 200 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    // Idempotenz: Session schon verarbeitet?
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (existingOrder) {
      console.log('Session already processed:', session.id)
      return new Response('ok', { status: 200 })
    }

    const customerEmail: string = session.customer_details?.email ?? ''
    const customerName: string = session.customer_details?.name ?? 'Unbekannt'
    const totalAmount: number = (session.amount_total ?? 0) / 100

    const { data: customer, error: cErr } = await supabase
      .from('customers')
      .insert({ name: customerName, email: customerEmail })
      .select('id')
      .single()
    if (cErr) throw cErr

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        order_type: 'tasting_voucher',
        payment_status: 'paid',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        total_amount: totalAmount,
        currency: session.currency ?? 'eur',
        metadata: { tasting_type: tastingType, persons },
      })
      .select('id')
      .single()
    if (oErr) throw oErr

    const { error: iErr } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_name: `Tasting-Gutschein: ${TASTING_LABELS[tastingType] ?? tastingType}`,
      tasting_type: tastingType,
      quantity: persons,
      unit_price: totalAmount / persons,
    })
    if (iErr) throw iErr

    const { data: voucherCode, error: vErr } = await supabase
      .rpc('generate_voucher_code', { p_tasting_type: tastingType })
    if (vErr) throw vErr

    const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    const { error: vcErr } = await supabase.from('vouchers').insert({
      voucher_code: voucherCode,
      order_id: order.id,
      customer_id: customer.id,
      tasting_type: tastingType,
      persons,
      status: 'active',
      valid_until: validUntil,
    })
    if (vcErr) throw vcErr

    const resendKey = Deno.env.get('RESEND_API_KEY')
    const websiteUrl = Deno.env.get('WEBSITE_URL') ?? 'https://genusswerte-bonn.de'

    if (resendKey && customerEmail) {
      await sendConfirmationEmail({
        resendKey, websiteUrl,
        to: customerEmail,
        name: customerName,
        voucherCode,
        tastingLabel: TASTING_LABELS[tastingType] ?? tastingType,
        persons,
        validUntil,
      })
    }

    console.log(`Voucher created: ${voucherCode} for ${customerEmail}`)
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('stripe-webhook processing error:', err)
    return new Response('ok', { status: 200 })
  }
})

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts: Record<string, string> = {}
    for (const part of signature.split(',')) {
      const [k, v] = part.split('=')
      parts[k] = v
    }

    const timestamp = parts['t']
    const v1 = parts['v1']
    if (!timestamp || !v1) return false

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const signed = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${timestamp}.${payload}`),
    )

    const expected = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return expected === v1
  } catch {
    return false
  }
}

async function sendConfirmationEmail(opts: {
  resendKey: string
  websiteUrl: string
  to: string
  name: string
  voucherCode: string
  tastingLabel: string
  persons: number
  validUntil: string
}) {
  const { resendKey, websiteUrl, to, name, voucherCode, tastingLabel, persons, validUntil } = opts
  const personsLabel = `${persons} ${persons === 1 ? 'Person' : 'Personen'}`
  const validDate = new Date(validUntil).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5ef;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;">
  <tr><td style="background:#1c3a2e;padding:32px 40px;text-align:center;">
    <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Genusswerte Bonn</p>
    <h1 style="margin:8px 0 0;color:#f9f5ef;font-size:22px;font-weight:400;">Dein Tasting-Gutschein</h1>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">Liebe/r ${name},</p>
    <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.7;">vielen Dank für deinen Kauf! Dein Tasting-Gutschein ist bereit.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;border-radius:4px;margin:0 0 28px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 4px;color:#888;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Dein Gutscheincode</p>
        <p style="margin:0 0 12px;color:#1c3a2e;font-size:26px;font-weight:700;letter-spacing:3px;">${voucherCode}</p>
        <p style="margin:0;color:#444;font-size:14px;">${tastingLabel} &middot; ${personsLabel}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;color:#1a1a1a;font-size:15px;font-weight:600;">So löst du deinen Gutschein ein:</p>
    <ol style="margin:0 0 24px;padding-left:20px;color:#444;font-size:14px;line-height:2.2;">
      <li>Besuche <a href="${websiteUrl}/gutschein-einloesen.html" style="color:#1c3a2e;">${websiteUrl.replace('https://', '')}/gutschein-einloesen</a></li>
      <li>Gib deinen Code ein</li>
      <li>Wähle einen verfügbaren Termin</li>
      <li>Du erhältst eine Bestätigung per E-Mail</li>
    </ol>
    <p style="margin:0 0 4px;color:#aaa;font-size:12px;">Gültig bis: ${validDate}</p>
    <p style="margin:20px 0 0;color:#aaa;font-size:12px;">Fragen? <a href="tel:+4922825908928" style="color:#1c3a2e;">0228 2590 8928</a></p>
  </td></tr>
  <tr><td style="background:#f0ebe1;padding:20px 40px;text-align:center;">
    <p style="margin:0;color:#aaa;font-size:11px;">Genusswerte Bonn &middot; Clemens-August-Stra&szlig;e 38&ndash;40 &middot; 53115 Bonn-Poppelsdorf</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Genusswerte Bonn <gutscheine@genusswerte-bonn.de>',
      to: [to],
      subject: `Dein Tasting-Gutschein: ${voucherCode}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
  }
}
