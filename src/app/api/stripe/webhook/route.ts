// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/utils/supabase/admin";

const relevantEvents = new Set(["checkout.session.completed"]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
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
    console.log("[Webhook] Iniciando processamento para sessão:", session.id);

    try {
      // Log de diagnóstico para a variável de ambiente mais crítica
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error(
          "[Webhook] ERRO CRÍTICO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não foi encontrada no ambiente da Vercel."
        );
        throw new Error(
          "Configuração de servidor incompleta: Chave de serviço em falta."
        );
      }
      console.log(
        "[Webhook] Chave de serviço do Supabase encontrada. A tentar a atualização..."
      );

      const empresaId = session.client_reference_id;
      if (!empresaId) throw new Error("'client_reference_id' não encontrado.");

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      // Adicionamos .select() para obter um feedback mais detalhado da operação
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq("empresa_id", empresaId)
        .select(); // .select() ajuda a confirmar que a linha foi encontrada e atualizada

      if (error) {
        // Log do erro completo do Supabase para máxima clareza
        console.error(
          `[Webhook] ERRO COMPLETO DO SUPABASE para empresa ${empresaId}:`,
          JSON.stringify(error, null, 2)
        );
        throw new Error(`Falha ao atualizar no Supabase: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.warn(
          `[Webhook] AVISO: A atualização foi executada sem erros, mas nenhuma linha foi modificada para a empresa ${empresaId}. Verifique se o empresa_id corresponde a uma subscrição 'incomplete'.`
        );
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
