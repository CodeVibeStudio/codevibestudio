import Stripe from "stripe";

// Lê a chave secreta do Stripe das variáveis de ambiente
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

// Cria e exporta uma instância única do SDK do Stripe para uso no backend.
// A versão da API é especificada para garantir consistência.
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
  typescript: true,
});
