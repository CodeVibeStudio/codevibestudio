// src/app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase"; // Apenas o cliente de admin é necessário aqui
import { stripe } from "@/lib/stripe";
import { plans } from "@/lib/stripe-config";

export async function POST(req: NextRequest) {
  const { empresa, email, password, plan } = await req.json();

  // Validação inicial dos dados
  if (!empresa || !email || !password || !plan) {
    return NextResponse.json(
      { message: "Por favor, preencha todos os campos obrigatórios." },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  let userId: string | undefined;

  try {
    // --- PASSO 1: Criar o utilizador com as credenciais de ADMIN ---
    // Esta é a correção principal. Usamos o cliente de admin para criar o utilizador.
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // O utilizador não precisará de confirmar o e-mail
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return NextResponse.json(
          { message: "Este e-mail já está cadastrado." },
          { status: 409 }
        );
      }
      console.error("Erro no Supabase Auth Admin:", authError);
      throw new Error(`Erro ao criar utilizador: ${authError.message}`);
    }

    if (!user) {
      throw new Error("Utilizador não foi criado por um motivo desconhecido.");
    }
    userId = user.id; // Guardamos o ID do utilizador para os próximos passos

    // --- PASSO 2: Inserir a empresa na base de dados ---
    // Usamos as suas colunas: 'nome' e 'user_id'
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .insert({ nome: empresa, user_id: userId })
      .select("id") // Selecionamos apenas o ID da empresa criada
      .single();

    if (empresaError || !empresaData) {
      console.error("Erro ao criar empresa:", empresaError);
      // Se a criação da empresa falhar, apagamos o utilizador para não deixar dados órfãos
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("Erro ao registrar a empresa na base de dados.");
    }

    const empresaId = empresaData.id;

    // --- PASSO 3: Lidar com a subscrição (Plano Gratuito ou Stripe) ---
    if (plan === "gratuito") {
      await supabaseAdmin.from("subscriptions").insert({
        empresa_id: empresaId,
        plano: "gratuito",
        status: "active",
      });
      // Para o plano gratuito, redirecionamos diretamente para o dashboard
      return NextResponse.json({ redirectUrl: "/dashboard" });
    } else {
      // Lógica do Stripe para planos pagos
      const selectedPlan = plans[plan as "starter" | "premium"];
      if (!selectedPlan || !selectedPlan.priceId) {
        throw new Error("Plano de pagamento inválido ou não encontrado.");
      }

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
        stripe_price_id: selectedPlan.priceId,
      });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!siteUrl) {
        throw new Error(
          "A variável de ambiente NEXT_PUBLIC_SITE_URL não está definida."
        );
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
        mode: "subscription",
        subscription_data: {
          trial_period_days: 15,
          metadata: { empresaId: empresaId },
        },
        success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/signup?plan=${plan}`, // Volta para a página de signup se cancelar
      });

      if (!session.url) {
        throw new Error("Erro ao criar sessão de pagamento do Stripe.");
      }
      return NextResponse.json({ redirectUrl: session.url });
    }
  } catch (error: any) {
    // Se ocorrer um erro em qualquer passo, este bloco será executado
    console.error("Erro completo na API de registro:", error);

    // Se o utilizador foi criado mas algo depois falhou, apaga-o
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
