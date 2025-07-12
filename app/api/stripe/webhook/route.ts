import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// Função para lidar com checkout completado
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // CORREÇÃO: Usar listLineItems para obter os itens da sessão
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });

  if (lineItems.data.length === 0) {
    console.warn("Nenhum line item encontrado para a sessão:", session.id);
    return;
  }

  const priceId = lineItems.data[0]?.price?.id;
  if (!priceId) {
    console.warn("Price ID não encontrado nos line items");
    return;
  }

  // Recuperar informações do cliente
  const customer = await stripe.customers.retrieve(customerId);
  const empresaId = (customer as any).metadata?.empresa_id;

  if (!empresaId) {
    console.error("empresa_id não encontrado no metadata do cliente");
    return;
  }

  // Salvar/atualizar assinatura no banco
  const { error } = await supabaseAdmin.from("subscriptions").upsert({
    empresa_id: empresaId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plano: priceId,
    current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias de trial
    status: "active",
  });

  if (error) {
    console.error("Erro ao salvar assinatura:", error);
    throw error;
  }

  console.log("Checkout completado com sucesso:", session.id);
}

// Função para lidar com pagamento bem-sucedido
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("Invoice não relacionada a uma assinatura");
    return;
  }

  // Recuperar detalhes da assinatura
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;

  // Atualizar período da assinatura
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      current_period_end: new Date(subscription.current_period_end * 1000),
      status: "active",
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Erro ao atualizar assinatura:", error);
    throw error;
  }

  console.log("Pagamento processado com sucesso:", invoice.id);
}

// Função para lidar com falha no pagamento
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("Invoice não relacionada a uma assinatura");
    return;
  }

  // Marcar assinatura como inativa
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "past_due",
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Erro ao atualizar status da assinatura:", error);
    throw error;
  }

  console.log("Pagamento falhou:", invoice.id);
}

// Função para lidar com atualização de assinatura
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price?.id;

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plano: priceId,
      current_period_end: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Erro ao atualizar assinatura:", error);
    throw error;
  }

  console.log("Assinatura atualizada:", subscription.id);
}

// Função para lidar com cancelamento de assinatura
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Erro ao cancelar assinatura:", error);
    throw error;
  }

  console.log("Assinatura cancelada:", subscription.id);
}
