import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { companyName, adminEmail, password, chosenPriceId } = await req.json();

  if (!companyName || !adminEmail || !password || !chosenPriceId) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  // 1. cria empresa
  const { data: empresa, error: empErr } = await supabaseAdmin
    .from('empresas')
    .insert({ nome: companyName })
    .select()
    .single();
  if (empErr) return NextResponse.json(empErr, { status: 400 });

  // 2. cria usuário
  await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
    user_metadata: { empresa_id: empresa.id, role: 'admin' }
  });

  // 3. checkout stripe
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: chosenPriceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup/cancel`
  });

  return NextResponse.json({ url: session.url });
}
