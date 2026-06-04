import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { corsHeaders } from '../_shared/cors.ts'

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

const PRICE_PER_PERSON: Record<string, number> = {
  wein_tasting:                  2900,
  afterwork_wein_tasting:        1900,
  gin_tasting:                   4500,
  champagner_popcorn_tasting:    3900,
  trueffel_champagner_tasting:   6600,
  whisky_tasting:                4500,
  craft_beer_tasting:            2500,
  wagyu_wein_champagner_tasting: 5500,
  apero_antipasti_tasting:       2900,
}

interface CheckoutBody {
  tasting_type: string
  persons: number
  customer_email?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: CheckoutBody = await req.json()
    const { tasting_type, persons } = body

    if (!tasting_type || !PRICE_PER_PERSON[tasting_type]) {
      return json({ error: 'INVALID_TASTING_TYPE' }, 400)
    }

    if (!persons || persons < 1 || persons > 6 || !Number.isInteger(persons)) {
      return json({ error: 'INVALID_PERSONS' }, 400)
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-04-10',
    })

    const websiteUrl = Deno.env.get('WEBSITE_URL') ?? 'https://genusswerte-bonn.de'
    const unitAmount = PRICE_PER_PERSON[tasting_type]
    const label = TASTING_LABELS[tasting_type]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: body.customer_email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: `Tasting-Gutschein: ${label}`,
              description: `Gutschein für ${persons} ${persons === 1 ? 'Person' : 'Personen'} — Termin wählst du nach Kauf`,
            },
          },
          quantity: persons,
        },
      ],
      metadata: {
        tasting_type,
        persons: String(persons),
        product_type: 'tasting_voucher',
      },
      success_url: `${websiteUrl}/gutschein-einloesen.html?checkout=success`,
      cancel_url: `${websiteUrl}/tastings.html?checkout=cancelled`,
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return json({ error: 'INTERNAL_ERROR' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
