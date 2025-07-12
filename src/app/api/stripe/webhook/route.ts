import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Sig mismatch' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const line = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = line.data[0]?.price?.id;
    const customer = await stripe.customers.retrieve(session.customer as string);
    const empresaId = (customer as any).metadata.empresa_id;

    await supabaseAdmin.from('subscriptions').upsert({
      empresa_id: empresaId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plano: priceId,
      status: 'active'
    });
  }

  return NextResponse.json({ received: true });
}
