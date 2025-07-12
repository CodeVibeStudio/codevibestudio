#!/usr/bin/env node
/**
 * bootstrap.js
 * Executa:  node bootstrap.js
 * Requer: Node 18+
 */
import { writeFileSync as w, mkdirSync as m, existsSync as e } from 'fs';
import { join } from 'path';

const root = process.cwd();
const must = (p) => { if (!e(p)) m(p, { recursive: true }); };

const dirs = [
  'src/app',
  'src/lib',
  'src/components/ui',
  'src/app/api/register',
  'src/app/api/stripe/webhook',
  'public/images'
];
dirs.forEach((d) => must(join(root, d)));

const files = [
  {
    path: 'src/lib/supabase.ts',
    code: `
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnon);
export const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
  auth: { persistSession: false }
});
`
  },
  {
    path: 'src/lib/stripe.ts',
    code: `
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});
`
  },
  {
    path: 'src/lib/stripe-config.ts',
    code: `
export const STRIPE_PRICES = {
  rescuenow: {
    starter: process.env.NODE_ENV === 'production'
      ? 'price_live_rescuenow_starter'
      : 'price_test_rescuenow_starter'
  }
};
`
  },
  {
    path: 'src/app/api/register/route.ts',
    code: `
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
    success_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/signup/success\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/signup/cancel\`
  });

  return NextResponse.json({ url: session.url });
}
`
  },
  {
    path: 'src/app/api/stripe/webhook/route.ts',
    code: `
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
`
  },
  {
    path: 'src/app/page.tsx',
    code: `
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">CodeVibe Studio 🚀</h1>
    </main>
  );
}
`
  },
  {
    path: '.env.local.example',
    code: `
NEXT_PUBLIC_SUPABASE_URL=preencha_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=preencha_aqui
SUPABASE_SERVICE_ROLE_KEY=preencha_aqui
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`
  }
];

files.forEach(({ path, code }) => {
  const full = join(root, path);
  if (!e(full)) w(full, code.trimStart(), 'utf8');
});

// verifica .env.local
const envPath = join(root, '.env.local');
if (!e(envPath)) {
  console.log('ℹ️  .env.local não encontrado. Copiando de exemplo.');
  w(envPath, files.find(f => f.path === '.env.local.example').code.trimStart(), 'utf8');
}

console.log('✅ Estrutura criada. Execute: npm install && npm run dev');
