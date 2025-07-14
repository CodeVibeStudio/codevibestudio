// src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  // O 'plan' aqui é o nome do plano, ex: "starter" ou "gratuito"
  const { empresa, email, password, plan, productSlug } = await req.json();

  if (!empresa || !email || !password || !plan || !productSlug) {
    return NextResponse.json(
      { message: "Dados incompletos. Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  let userId: string | undefined;

  try {
    // 1. Encontrar o produto no Supabase
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

    // 2. Criar o utilizador
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
          { message: "Este e-mail já está registado." },
          { status: 409 }
        );
      }
      throw new Error(`Erro ao criar utilizador: ${authError.message}`);
    }
    if (!user) throw new Error("O utilizador não foi criado com sucesso.");
    userId = user.id;

    // 3. Criar a empresa
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .insert({ nome: empresa, owner_id: userId })
      .select("id")
      .single();

    if (empresaError || !empresaData) {
      throw new Error("Erro ao registar a empresa.");
    }
    const empresaId = empresaData.id;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      throw new Error(
        "A variável de ambiente NEXT_PUBLIC_SITE_URL não está configurada."
      );
    }

    // ** CORREÇÃO 2: TRATAMENTO ESPECIAL PARA O PLANO GRATUITO **
    if (plan.toLowerCase() === "gratuito") {
      await supabaseAdmin.from("subscriptions").insert({
        empresa_id: empresaId,
        plano: "Gratuito", // Guardamos o nome correto
        status: "active",
        product_id: productId,
      });
      // Redireciona diretamente para o dashboard
      return NextResponse.json({ redirectUrl: `${siteUrl}/dashboard` });
    }

    // --- Lógica para planos pagos ---

    // ** CORREÇÃO 1: USAR .ilike() PARA IGNORAR MAIÚSCULAS/MINÚSCULAS **
    const { data: planData, error: planError } = await supabaseAdmin
      .from("plans")
      .select("stripe_price_id")
      .ilike("name", plan) // .ilike() é case-insensitive
      .eq("product_id", productId)
      .single();

    if (planError || !planData || !planData.stripe_price_id) {
      console.error(
        `Plano '${plan}' ou o seu 'stripe_price_id' não foi encontrado na base de dados para o produto ${productId}.`,
        planError
      );
      throw new Error(
        "A configuração de pagamento para o plano selecionado está indisponível."
      );
    }

    const stripePriceId = planData.stripe_price_id;

    const customer = await stripe.customers.create({
      email,
      name: empresa,
      metadata: { empresaId: empresaId },
    });

    await supabaseAdmin.from("subscriptions").insert({
      empresa_id: empresaId,
      plano: plan,
      status: "incomplete",
      stripe_customer_id: customer.id,
      product_id: productId,
      stripe_price_id: stripePriceId,
    });

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
      success_url: `${siteUrl}/dashboard`,
      cancel_url: `${siteUrl}/`,
    });

    if (!session.url) {
      throw new Error("Erro ao criar a sessão de pagamento do Stripe.");
    }

    return NextResponse.json({ redirectUrl: session.url });
  } catch (error: any) {
    console.error("Erro completo na API de registo:", error);
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
