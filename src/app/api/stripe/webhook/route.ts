// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

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

  console.log(`[Stripe Webhook] 🔔 Evento recebido: ${event.type}`);
  const supabaseAdmin = getSupabaseAdmin();

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const empresaId = session.client_reference_id;

          if (!empresaId)
            throw new Error("'client_reference_id' não encontrado.");
          if (!session.subscription)
            throw new Error("ID da subscrição não encontrado.");

          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ),
            })
            .eq("empresa_id", empresaId);

          if (error) {
            console.error(
              `[Stripe Webhook] ❌ ERRO no Supabase ao atualizar subscrição para empresa ${empresaId}:`,
              error
            );
            throw new Error(`Falha ao atualizar no Supabase: ${error.message}`);
          }

          console.log(
            `[Stripe Webhook] ✅ SUCESSO: Subscrição para empresa ${empresaId} atualizada para ${subscription.status}`
          );
          break;
        }
        // ... outros casos
      }
    } catch (error) {
      console.error("[Stripe Webhook] Erro final no processamento:", error);
      return NextResponse.json(
        { message: "Erro interno no processamento." },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
