// src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { empresa, email, password, plan, productSlug } = await req.json();

  if (!empresa || !email || !password || !plan || !productSlug) {
    return NextResponse.json(
      { message: "Dados incompletos." },
      { status: 400 }
    );
  }

  let userId: string | undefined;
  let empresaId: string | undefined;

  try {
    // 1. Encontrar o ID do produto
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

    // 2. Criar o utilizador no Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirma o e-mail
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return NextResponse.json(
          { message: "Este e-mail já está registado." },
          { status: 409 }
        );
      }
      throw new Error(`Erro ao criar utilizador: ${authError.message}`);
    }
    if (!user) throw new Error("O utilizador não foi criado com sucesso.");
    userId = user.id;

    // 3. Criar a empresa associada
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .insert({ nome: empresa, owner_id: userId })
      .select("id")
      .single();

    if (empresaError || !empresaData) {
      throw new Error("Erro ao registar a empresa.");
    }
    empresaId = empresaData.id;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      throw new Error(
        "A variável de ambiente NEXT_PUBLIC_SITE_URL não está configurada."
      );
    }

    // 4. Lidar com o plano selecionado

    // Se for o plano gratuito, cria a subscrição e termina o fluxo.
    if (plan.toLowerCase() === "gratuito") {
      await supabaseAdmin.from("subscriptions").insert({
        empresa_id: empresaId,
        plano: "Gratuito",
        status: "active",
        product_id: productId,
      });
      return NextResponse.json({ redirectUrl: `${siteUrl}/dashboard` });
    }

    // --- Lógica para planos pagos ---

    // Encontra o stripe_price_id para o plano e produto corretos
    const { data: planData, error: planError } = await supabaseAdmin
      .from("plans")
      .select("stripe_price_id")
      .ilike("name", plan) // .ilike() ignora maiúsculas/minúsculas
      .eq("product_id", productId)
      .single();

    if (planError || !planData?.stripe_price_id) {
      throw new Error(
        `Configuração de pagamento para o plano '${plan}' está indisponível.`
      );
    }
    const stripePriceId = planData.stripe_price_id;

    // Cria o cliente no Stripe
    const customer = await stripe.customers.create({
      email,
      name: empresa,
      metadata: { empresaId: empresaId },
    });

    // Cria a subscrição inicial como 'incomplete'
    await supabaseAdmin.from("subscriptions").insert({
      empresa_id: empresaId,
      plano: plan,
      status: "incomplete",
      stripe_customer_id: customer.id,
      product_id: productId,
    });

    // Cria a sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 15,
        metadata: { empresaId: empresaId },
      },
      client_reference_id: empresaId,
      success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
    });

    if (!session.url) {
      throw new Error("Erro ao criar a sessão de pagamento do Stripe.");
    }

    return NextResponse.json({ redirectUrl: session.url });
  } catch (error: any) {
    console.error("Erro completo na API de registo:", error.message);

    // Lógica de limpeza em caso de falha
    if (userId) {
      if (empresaId) {
        await supabaseAdmin.from("empresas").delete().eq("id", empresaId);
        console.log(`Empresa órfã [${empresaId}] apagada.`);
      }
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.log(`Utilizador órfão [${userId}] apagado.`);
    }

    return NextResponse.json(
      { message: error.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
