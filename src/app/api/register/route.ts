// src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { plans } from "@/lib/stripe-config";

export async function POST(req: NextRequest) {
  // CORREÇÃO: Recebemos o productSlug do frontend
  const { empresa, email, password, plan, productSlug } = await req.json();

  if (!empresa || !email || !password || !plan || !productSlug) {
    return NextResponse.json(
      { message: "Dados incompletos. O produto não foi especificado." },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  let userId: string | undefined;

  try {
    // --- PASSO 1: Encontrar o ID do produto a partir do slug ---
    const { data: productData, error: productError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .single();

    if (productError || !productData) {
      throw new Error(
        `Produto com o slug "${productSlug}" não foi encontrado.`
      );
    }
    const productId = productData.id;

    // --- PASSO 2: Criar o utilizador ---
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return NextResponse.json(
          { message: "Este e-mail já está cadastrado." },
          { status: 409 }
        );
      }
      throw new Error(`Erro ao criar utilizador: ${authError.message}`);
    }
    if (!user) throw new Error("Utilizador não foi criado.");
    userId = user.id;

    // --- PASSO 3: Inserir a empresa ---
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .insert({ nome: empresa, owner_id: userId })
      .select("id")
      .single();

    if (empresaError || !empresaData)
      throw new Error("Erro ao registrar a empresa.");
    const empresaId = empresaData.id;

    // --- PASSO 4: Criar a subscrição com o product_id ---
    if (plan === "gratuito") {
      await supabaseAdmin.from("subscriptions").insert({
        empresa_id: empresaId,
        plano: "gratuito",
        status: "active",
        product_id: productId, // <<<<<<< CORREÇÃO
      });
      return NextResponse.json({ redirectUrl: "/dashboard" });
    } else {
      const selectedPlan = plans[plan as "starter" | "premium"];
      if (!selectedPlan) throw new Error("Plano inválido.");

      const customer = await stripe.customers.create({
        email,
        name: empresa,
        metadata: { empresaId },
      });

      await supabaseAdmin.from("subscriptions").insert({
        empresa_id: empresaId,
        plano: plan,
        status: "incomplete",
        stripe_customer_id: customer.id,
        stripe_price_id: selectedPlan.priceId,
        product_id: productId, // <<<<<<< CORREÇÃO
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!siteUrl) throw new Error("URL do site não configurada.");

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
        mode: "subscription",
        subscription_data: { trial_period_days: 15, metadata: { empresaId } },
        success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/produtos/${productSlug}`,
      });

      if (!session.url) throw new Error("Erro ao criar sessão de pagamento.");
      return NextResponse.json({ redirectUrl: session.url });
    }
  } catch (error: any) {
    console.error("Erro completo na API de registro:", error);
    if (userId) {
      await supabaseAdmin.auth.admin
        .deleteUser(userId)
        .catch((err) =>
          console.error("Falha ao apagar utilizador órfão:", err)
        );
    }
    return NextResponse.json(
      { message: error.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
