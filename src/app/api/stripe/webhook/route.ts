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
  const headersList = headers();
  const signature = headersList.get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "❌ A variável de ambiente STRIPE_WEBHOOK_SECRET não está definida no servidor."
    );
    return NextResponse.json(
      { error: "Configuração do servidor incorreta." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(
      `❌ Erro na verificação da assinatura do webhook: ${err.message}`
    );
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

          if (!empresaId) {
            throw new Error("'client_reference_id' não encontrado na sessão.");
          }
          if (!session.subscription) {
            throw new Error(
              "ID da subscrição do Stripe não encontrado na sessão."
            );
          }

          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // ** CORREÇÃO FINAL: Apenas atualizamos os campos necessários **
          // O stripe_price_id já foi guardado na API de registo.
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              // A linha abaixo foi removida, pois causava o erro e não é mais necessária aqui.
              // stripe_price_id: subscription.items.data[0].price.id,
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ),
            })
            .eq("empresa_id", empresaId);

          if (error) {
            console.error(
              `[Stripe Webhook] ❌ ERRO no Supabase ao atualizar a subscrição para a empresa ${empresaId}:`,
              error
            );
            throw new Error(
              `Falha ao atualizar a subscrição no Supabase: ${error.message}`
            );
          }

          console.log(
            `[Stripe Webhook] ✅ SUCESSO: Subscrição para empresa ${empresaId} atualizada para ${subscription.status}`
          );
          break;
        }

        // ... outros casos de evento
      }
    } catch (error) {
      console.error(
        "[Stripe Webhook] Erro final no processamento do webhook:",
        error
      );
      return NextResponse.json(
        {
          message:
            "Webhook recebido, mas ocorreu um erro interno no processamento.",
        },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
