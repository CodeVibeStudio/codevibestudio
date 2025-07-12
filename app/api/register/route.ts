// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { STRIPE_PRICES } from "@/lib/stripe-config";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const { companyName, adminEmail, password, chosenPriceId } = await req.json();

  // Validar se o priceId é válido
  const validPriceIds = Object.values(STRIPE_PRICES).flatMap((product) =>
    Object.values(product)
  );
  if (!validPriceIds.includes(chosenPriceId)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  // 1. Cria empresa
  const { data: empresa, error: empErr } = await supabaseAdmin
    .from("empresas")
    .insert({ nome: companyName })
    .select()
    .single();
  if (empErr) return NextResponse.json({ empErr }, { status: 400 });

  // 2. Cria usuário
  const { error: userErr } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
    user_metadata: { empresa_id: empresa.id, role: "admin" },
  });
  if (userErr) return NextResponse.json({ userErr }, { status: 400 });

  // 3. Stripe customer + checkout
  const customer = await stripe.customers.create({
    email: adminEmail,
    metadata: { empresa_id: empresa.id },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: chosenPriceId, quantity: 1 }],
    subscription_data: { trial_period_days: 15 },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
