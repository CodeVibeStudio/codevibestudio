// Configurações dos produtos e preços do Stripe
export const STRIPE_PRICES = {
  rescuenow: {
    free: 'price_free_rescuenow', // Geralmente R$ 0,00
    starter: 'price_1Rk1CeGhVaKYsMKqCEhWJuv5', // Exemplo: price_1NXX...
    premium: 'price_1Rk1CvGhVaKYsMKqzDXv740N'  // Exemplo: price_1NXX...
  },
  // Futuro produto
  wordrope: {
    basic: 'price_1GHI789basic',
    pro: 'price_1JKL012pro'
  }
}

// Metadados dos planos
export const PLANS_METADATA = {
  rescuenow: {
    free: {
      name: 'Gratuito',
      price: 'R$ 0,00',
      features: ['Até 5 usuários', 'Funcionalidades básicas']
    },
    starter: {
      name: 'Starter',
      price: 'R$ 29,00/mês',
      features: ['Até 20 usuários', 'Relatórios básicos', 'Suporte email']
    },
    premium: {
      name: 'Premium',
      price: 'R$ 99,00/mês',
      features: ['Usuários ilimitados', 'Relatórios avançados', 'Suporte prioritário']
    }
  }
}
