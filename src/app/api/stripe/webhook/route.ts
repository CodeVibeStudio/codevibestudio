import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
// CORREÇÃO: Importamos a função getSupabaseAdmin
import { getSupabaseAdmin } from "@/lib/supabase";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro na verificação do webhook: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (relevantEvents.has(event.type)) {
    // CORREÇÃO: Chamamos a função para obter o cliente de administração
    const supabaseAdmin = getSupabaseAdmin();

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const customerId = session.customer as string;

          const customer = (await stripe.customers.retrieve(
            customerId
          )) as Stripe.Customer;
          const empresaId = customer.metadata.empresaId;

          if (!empresaId) {
            throw new Error(
              "empresaId não encontrado nos metadados do cliente Stripe."
            );
          }

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ),
            })
            .eq("stripe_customer_id", customerId);

          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              stripe_price_id: subscription.items.data[0].price.id,
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ),
            })
            .eq("stripe_subscription_id", subscription.id);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", subscription.id);
          break;
        }

        default:
          throw new Error("Evento de webhook não tratado.");
      }
    } catch (error) {
      console.error("Erro ao processar evento do webhook:", error);
      return NextResponse.json(
        { message: "Erro interno ao processar webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

//Forcar atualização
