// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe"; // Assumindo que o seu cliente stripe está em /lib
// ** MUDANÇA CRUCIAL: Importa o novo cliente de administrador **
import { supabaseAdmin } from "@/utils/supabase/admin";

const relevantEvents = new Set(["checkout.session.completed"]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET não está configurado.");
    return NextResponse.json(
      { error: "Configuração do servidor incorreta." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(
      "[Webhook] Processando checkout.session.completed:",
      session.id
    );

    try {
      const empresaId = session.client_reference_id;
      if (!empresaId) throw new Error("'client_reference_id' não encontrado.");
      if (!session.subscription)
        throw new Error("ID da subscrição não encontrado.");

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      // ** USA O CLIENTE DE ADMINISTRADOR PARA FAZER O UPDATE **
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("empresa_id", empresaId);

      if (error) {
        console.error(
          `[Webhook] ❌ ERRO no Supabase ao atualizar subscrição para empresa ${empresaId}:`,
          error
        );
        throw new Error(`Falha ao atualizar no Supabase: ${error.message}`);
      }

      console.log(
        `[Webhook] ✅ SUCESSO: Subscrição para empresa ${empresaId} atualizada para ${subscription.status}`
      );
    } catch (error) {
      console.error("[Webhook] Erro final no processamento:", error);
      return NextResponse.json(
        { message: "Erro interno no processamento." },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
