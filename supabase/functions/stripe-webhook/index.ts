import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Kein CORS — dieser Endpoint wird nur von Stripe aufgerufen, nie vom Browser

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

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-04-10',
  })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Nur erfolgreiche Checkouts verarbeiten
  if (event.type !== 'checkout.session.completed') {
    return new Response('ok', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  const tastingType = session.metadata?.tasting_type
  const personsRaw = session.metadata?.persons
  const persons = personsRaw ? parseInt(personsRaw, 10) : null

  if (!tastingType || !persons) {
    console.error('Missing metadata in session:', session.id)
    return new Response('Missing metadata', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    // Idempotenz: Wenn Session schon verarbeitet wurde, noop
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (existingOrder) {
      console.log('Session already processed:', session.id)
      return new Response('ok', { status: 200 })
    }

    const customerEmail = session.customer_details?.email ?? ''
    const customerName = session.customer_details?.name ?? 'Unbekannt'

    // 1. Customer anlegen
    const { data: customer, error: cErr } = await supabase
      .from('customers')
      .insert({ name: customerName, email: customerEmail })
      .select('id')
      .single()

    if (cErr) throw cErr

    const totalAmount = (session.amount_total ?? 0) / 100

    // 2. Order anlegen
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        order_type: 'tasting_voucher',
        payment_status: 'paid',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        total_amount: totalAmount,
        currency: session.currency ?? 'eur',
        metadata: { tasting_type: tastingType, persons },
      })
      .select('id')
      .single()

    if (oErr) throw oErr

    // 3. Order Item anlegen
    const { error: iErr } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_name: `Tasting-Gutschein: ${TASTING_LABELS[tastingType] ?? tastingType}`,
        tasting_type: tastingType,
        quantity: persons,
        unit_price: totalAmount / persons,
      })

    if (iErr) throw iErr

    // 4. Gutscheincode generieren (DB-Funktion, service_role)
    const { data: voucherCode, error: vErr } = await supabase
      .rpc('generate_voucher_code', { p_tasting_type: tastingType })

    if (vErr) throw vErr

    // 5. Voucher anlegen
    const { error: vcErr } = await supabase
      .from('vouchers')
      .insert({
        voucher_code: voucherCode,
        order_id: order.id,
        customer_id: customer.id,
        tasting_type: tastingType,
        persons,
        status: 'active',
        // Gutscheine sind 1 Jahr gültig
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      })

    if (vcErr) throw vcErr

    // 6. Bestätigungs-E-Mail via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      await sendConfirmationEmail({
        resendKey,
        to: customerEmail,
        name: customerName,
        voucherCode,
        tastingLabel: TASTING_LABELS[tastingType] ?? tastingType,
        persons,
        websiteUrl: Deno.env.get('WEBSITE_URL') ?? 'https://genusswerte-bonn.de',
      })
    }

    console.log(`Voucher created: ${voucherCode} for ${customerEmail}`)
    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('stripe-webhook processing error:', err)
    // 200 zurückgeben damit Stripe nicht endlos retryt —
    // Fehler werden über Supabase Logs überwacht
    return new Response('ok', { status: 200 })
  }
})

async function sendConfirmationEmail(opts: {
  resendKey: string
  to: string
  name: string
  voucherCode: string
  tastingLabel: string
  persons: number
  websiteUrl: string
}) {
  const { resendKey, to, name, voucherCode, tastingLabel, persons, websiteUrl } = opts

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9f5ef;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">
        <tr>
          <td style="background:#1c3a2e;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#c9a84c;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Genusswerte Bonn</p>
            <h1 style="margin:8px 0 0;color:#f9f5ef;font-size:22px;font-weight:400;">Dein Tasting-Gutschein</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">Liebe/r ${name},</p>
            <p style="margin:0 0 24px;color:#444;font-size:15px;line-height:1.7;">vielen Dank für deinen Kauf! Dein Tasting-Gutschein ist bereit.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;border-radius:4px;margin:0 0 28px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 4px;color:#888;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Dein Gutscheincode</p>
                  <p style="margin:0 0 16px;color:#1c3a2e;font-size:24px;font-weight:700;letter-spacing:2px;">${voucherCode}</p>
                  <p style="margin:0;color:#444;font-size:14px;">${tastingLabel} · ${persons} ${persons === 1 ? 'Person' : 'Personen'}</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#1a1a1a;font-size:15px;font-weight:600;">So löst du deinen Gutschein ein:</p>
            <ol style="margin:0 0 24px;padding-left:20px;color:#444;font-size:14px;line-height:2;">
              <li>Besuche <a href="${websiteUrl}/gutschein-einloesen.html" style="color:#1c3a2e;">genusswerte-bonn.de/gutschein-einloesen</a></li>
              <li>Gib deinen Code ein</li>
              <li>Wähle einen verfügbaren Termin</li>
              <li>Fertig — du erhältst eine Bestätigung</li>
            </ol>

            <p style="margin:0 0 4px;color:#888;font-size:12px;">Gültig bis: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p style="margin:24px 0 0;color:#888;font-size:12px;">Fragen? Meld dich bei uns: <a href="tel:+4922825908928" style="color:#1c3a2e;">0228 2590 8928</a></p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0ebe1;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#888;font-size:11px;">Genusswerte Bonn · Clemens-August-Straße 38–40 · 53115 Bonn-Poppelsdorf</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
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
}
