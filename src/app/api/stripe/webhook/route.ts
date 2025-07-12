// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const priceId = session.items?.data[0]?.price?.id ?? '';

    // empresa_id foi salvo no metadata
    const customer = await stripe.customers.retrieve(customerId);
    const empresaId = (customer as any).metadata.empresa_id;

    await supabaseAdmin.from('subscriptions').upsert({
      empresa_id: empresaId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plano: priceId,
      current_period_end: new Date((session as any).current_period_end * 1000),
    });
  }

  return NextResponse.json({ received: true });
}
