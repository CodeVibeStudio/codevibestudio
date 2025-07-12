// Mapeia os IDs dos nossos planos para os IDs de Preço do Stripe.
// !! IMPORTANTE !!
// Substitua os valores 'price_...' pelos IDs de Preço reais
// que você copiou do seu Dashboard do Stripe na Etapa 3.

export const plans = {
  gratuito: {
    priceId: null, // Plano gratuito não tem preço no Stripe
    name: "Gratuito",
  },
  starter: {
    priceId: "price_1Rk1CeGhVaKYsMKqCEhWJuv5", // <-- SUBSTITUA AQUI
    name: "Starter",
  },
  premium: {
    priceId: "price_1Rk1CvGhVaKYsMKqzDXv740N", // <-- SUBSTITUA AQUI
    name: "Premium",
  },
};
