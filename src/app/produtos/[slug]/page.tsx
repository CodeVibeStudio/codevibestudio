// src/app/produtos/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header"; // Reutilize o seu Header
import Footer from "@/components/Footer"; // Reutilize o seu Footer

// Tipos de dados (é bom mantê-los consistentes)
type Product = {
  id: number;
  name: string;
  slogan: string;
  description: string;
  logo_url: string;
};

type Plan = {
  id: number;
  name: string;
  price: number;
  features: string[];
  is_featured: boolean;
};

/**
 * SOLUÇÃO PARA O ERRO DE BUILD:
 * Esta função busca todos os produtos que têm um 'slug' e retorna um array
 * no formato que o Next.js espera: [{ slug: 'produto-1' }, { slug: 'produto-2' }]
 * Isso permite que o Next.js pré-renderize todas as páginas de produtos no momento do build.
 */
export async function generateStaticParams() {
  const { data: products, error } = await supabase
    .from("products")
    .select("slug") // Seleciona apenas a coluna 'slug'
    .not("slug", "is", null); // Garante que apenas produtos com slug sejam incluídos

  if (error || !products) {
    // Se houver erro ou nenhum produto, retorna um array vazio para não quebrar o build.
    console.error("Erro ao buscar slugs para generateStaticParams:", error);
    return [];
  }

  // Mapeia o resultado para o formato correto.
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Componente para renderizar um cartão de plano
function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`border-2 rounded-xl p-8 text-center flex flex-col ${plan.is_featured ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}
    >
      {plan.is_featured && (
        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full self-center mb-4">
          Mais Popular
        </span>
      )}
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
      <p className="text-4xl font-extrabold text-gray-900 mb-4">
        R${plan.price}
        <span className="text-lg font-medium text-gray-500">/mês</span>
      </p>
      <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
      <a
        href="#"
        className={`mt-auto w-full font-bold py-3 px-8 rounded-lg text-lg transition-colors ${plan.is_featured ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
      >
        Começar Agora
      </a>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Busca os detalhes do produto usando o slug da URL
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .single(); // .single() pega um único resultado ou retorna erro se não encontrar/encontrar muitos

  // 2. Se o produto não for encontrado, exibe uma página 404
  if (productError || !product) {
    console.error(
      "Produto não encontrado para o slug:",
      params.slug,
      productError
    );
    notFound();
  }

  // 3. Busca os planos associados a este produto
  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("*")
    .eq("product_id", product.id)
    .order("price", { ascending: true });

  if (plansError) {
    console.error(
      "Erro ao buscar planos para o produto:",
      product.id,
      plansError
    );
    // Não quebra a página, apenas não mostra os planos
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="container mx-auto px-6 py-16">
        {/* Seção de Cabeçalho do Produto */}
        <section className="text-center mb-16">
          <Image
            src={product.logo_url}
            alt={`Logo ${product.name}`}
            width={100}
            height={100}
            className="rounded-2xl mx-auto mb-6 border-4 border-white shadow-lg"
          />
          <h1 className="text-5xl font-extrabold text-gray-900">
            {product.name}
          </h1>
          <p className="text-xl text-gray-600 mt-2">{product.slogan}</p>
          <p className="max-w-3xl mx-auto text-lg text-gray-700 mt-4">
            {product.description}
          </p>
        </section>

        {/* Seção de Planos */}
        {plans && plans.length > 0 && (
          <section>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              Nossos Planos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
