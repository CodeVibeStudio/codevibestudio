import Link from "next/link";

// Definição do tipo para um plano
type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  planId: "gratuito" | "starter" | "premium";
  highlight?: boolean;
};

// Dados dos planos
const plans: Plan[] = [
  {
    name: "Gratuito",
    price: "R$0",
    description: "Para quem está começando a organizar o negócio.",
    features: [
      "1 Usuário",
      "50 Clientes",
      "Relatórios Básicos",
      "Suporte Comunitário",
    ],
    cta: "Começar Gratuitamente",
    planId: "gratuito",
  },
  {
    name: "Starter",
    price: "R$29",
    description: "Ideal para pequenas empresas em crescimento.",
    features: [
      "5 Usuários",
      "500 Clientes",
      "Relatórios Avançados",
      "Integração com E-mail",
      "Suporte via Chat",
    ],
    cta: "Iniciar Teste de 15 Dias",
    planId: "starter",
    highlight: true,
  },
  {
    name: "Premium",
    price: "R$99",
    description: "Para empresas que precisam de todo o poder da plataforma.",
    features: [
      "Usuários Ilimitados",
      "Clientes Ilimitados",
      "API de Acesso",
      "Gerente de Conta Dedicado",
      "Suporte Prioritário",
    ],
    cta: "Iniciar Teste de 15 Dias",
    planId: "premium",
  },
];

// Componente para o card de preço
function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`border rounded-lg p-8 flex flex-col ${
        plan.highlight
          ? "border-primaria scale-105 bg-white"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      {plan.highlight && (
        <span className="bg-primaria text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">
          MAIS POPULAR
        </span>
      )}
      <h3 className="text-2xl font-bold text-texto">{plan.name}</h3>
      <p className="text-secundaria mt-2 h-12">{plan.description}</p>
      <div className="mt-6">
        <span className="text-5xl font-extrabold text-texto">{plan.price}</span>
        {plan.price !== "R$0" && <span className="text-secundaria">/mês</span>}
      </div>
      <ul className="mt-8 space-y-4 text-secundaria flex-grow">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={`/signup?plan=${plan.planId}`}
        className={`mt-8 block w-full text-center font-bold py-3 px-6 rounded-lg transition-colors ${
          plan.highlight
            ? "bg-primaria text-white hover:bg-blue-700"
            : "bg-white text-primaria border border-primaria hover:bg-blue-50"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export default function RescueNowPage() {
  return (
    <div className="bg-fundo min-h-screen">
      <header className="py-6">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="text-3xl font-bold text-primaria">
            CodeVibe Studio
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-texto">RescueNow</h1>
          <p className="text-2xl text-primaria font-semibold mt-2 mb-6">
            O Controle na Palma da Sua Mão
          </p>
          <p className="text-lg text-secundaria">
            Escolha o plano que melhor se adapta às necessidades da sua empresa
            e comece a transformar sua gestão hoje mesmo. Todos os planos pagos
            incluem um teste gratuito de 15 dias, sem compromisso.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.planId} plan={plan} />
          ))}
        </div>
      </main>
    </div>
  );
}
