// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/utils/supabase/admin";

// Função auxiliar para atualizar ou inserir dados da subscrição
const upsertSubscriptionRecord = async (
  subscription: Stripe.Subscription,
  empresaId?: string
) => {
  // Busca os detalhes do produto e do preço para obter o nome do plano
  const priceId = subscription.items.data[0].price.id;
  const price = await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  });
  const planName =
    (price.product as Stripe.Product)?.name || "Plano Desconhecido";

  const subscriptionData = {
    // Se o empresaId for fornecido, inclua-o. Caso contrário, não o altere.
    ...(empresaId && { empresa_id: empresaId }),
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plano: planName, // CORRIGIDO: Usa a coluna 'plano' com o nome do plano
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
  };

  // Usamos 'upsert' para criar a linha se não existir, ou atualizá-la se já existir.
  // A condição de conflito é o 'stripe_subscription_id', que é único.
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

  if (error) {
    console.error(
      `[Supabase Upsert Error for Subscription ${subscription.id}]:`,
      error.message
    );
    throw error;
  }

  console.log(
    `✅ Subscrição ${subscription.id} salva/atualizada com status: ${subscription.status} e plano: ${planName}`
  );
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "ERRO: A variável de ambiente STRIPE_WEBHOOK_SECRET não está definida."
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
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // Evento principal: Ocorre quando o checkout é concluído pela primeira vez.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          // O 'client_reference_id' é crucial para associar a subscrição à empresa correta.
          const empresaId = session.client_reference_id;
          if (!empresaId) {
            console.error(
              `[Webhook ERRO CRÍTICO]: 'client_reference_id' (empresaId) não encontrado na sessão ${session.id}. Não é possível associar a subscrição a uma empresa.`
            );
            // Retornamos 200 para não recebermos o mesmo erro repetidamente.
            return NextResponse.json(
              { message: "client_reference_id em falta." },
              { status: 200 }
            );
          }

          // A função upsert irá criar ou atualizar o registo, associando o empresa_id.
          await upsertSubscriptionRecord(subscription, empresaId);
        }
        break;
      }

      // Ocorre em renovações, upgrades, downgrades, etc.
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionRecord(subscription);
        break;
      }

      // Ocorre quando a subscrição é cancelada (pelo cliente ou por falha de pagamento)
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // A função upsert irá atualizar o status para 'canceled'.
        await upsertSubscriptionRecord(subscription);
        break;
      }

      default:
      // console.log(`Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error("[Webhook] Erro no processamento do evento:", error);
    // Retornamos 200 para que o Stripe não tente reenviar o evento indefinidamente para este erro.
    // O erro já foi logado para depuração.
    return NextResponse.json(
      { message: "Erro interno no processamento do webhook." },
      { status: 200 }
    );
  }

  return NextResponse.json({ received: true });
}
