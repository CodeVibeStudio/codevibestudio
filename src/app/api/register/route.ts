import { NextRequest, NextResponse } from "next/server";
import { supabase, getSupabaseAdmin } from "@/lib/supabase"; // Importamos as duas versões
import { stripe } from "@/lib/stripe";
import { plans } from "@/lib/stripe-config";

export async function POST(req: NextRequest) {
  try {
    const { empresa, email, password, plan } = await req.json();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error("Erro no Supabase Auth:", authError);
      return NextResponse.json(
        { message: authError?.message || "Erro ao criar usuário." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    // CORREÇÃO: Chamamos a função para obter o cliente de administração.
    const supabaseAdmin = getSupabaseAdmin();

    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from("empresas")
      .insert({ nome: empresa, user_id: userId })
      .select()
      .single();

    if (empresaError || !empresaData) {
      console.error("Erro ao criar empresa:", empresaError);
      return NextResponse.json(
        { message: "Erro ao registrar empresa." },
        { status: 500 }
      );
    }

    const empresaId = empresaData.id;

    if (plan === "gratuito") {
      await supabaseAdmin.from("subscriptions").insert({
        empresa_id: empresaId,
        plano: "gratuito",
        status: "active",
      });
      return NextResponse.json({ redirectUrl: "/success" });
    } else {
      const selectedPlan = plans[plan as "starter" | "premium"];
      if (!selectedPlan || !selectedPlan.priceId) {
        return NextResponse.json(
          { message: "Plano inválido." },
          { status: 400 }
        );
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

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
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
        cancel_url: `${siteUrl}/produtos/rescuenow`,
      });

      if (!session.url) {
        return NextResponse.json(
          { message: "Erro ao criar sessão de pagamento." },
          { status: 500 }
        );
      }
      return NextResponse.json({ redirectUrl: session.url });
    }
  } catch (error: any) {
    console.error("Erro na API de registro:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
