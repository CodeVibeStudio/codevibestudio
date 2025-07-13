// src/app/produtos/[slug]/page.tsx
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

// CORREÇÃO: Definimos tipos explícitos para os nossos dados
type Plan = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  features: string[] | null;
  stripe_price_id: string | null;
};

type Product = {
  id: number;
  name: string;
  slogan: string | null;
  description: string | null;
};

// CORREÇÃO: Definimos um tipo explícito para as props da página
interface ProductPlansPageProps {
  params: { slug: string };
}

// Função para buscar os dados do produto e seus planos no servidor
async function getProductWithPlans(slug: string) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, slogan, description")
    .eq("slug", slug)
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("id, name, description, price, features, stripe_price_id")
    .eq("product_id", product.id)
    .order("price", { ascending: true });

  return { product: product as Product, plans: (plans as Plan[]) || [] };
}

export default async function ProductPlansPage({
  params,
}: ProductPlansPageProps) {
  const data = await getProductWithPlans(params.slug);

  if (!data) {
    notFound();
  }

  const { product, plans } = data;

  return (
    <div className="bg-fundo min-h-screen">
      <header className="py-6">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/codevibestudiologo.png"
              alt="Logo CodeVibe Studio"
              width={60}
              height={60}
              className="rounded-md"
            />
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-texto">{product.name}</h1>
          <p className="text-2xl text-primaria font-semibold mt-2 mb-6">
            {product.slogan}
          </p>
          <p className="text-lg text-texto-claro">{product.description}</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="border rounded-lg p-8 flex flex-col bg-white shadow-lg"
            >
              <h3 className="text-2xl font-bold text-texto">{plan.name}</h3>
              <p className="text-secundaria mt-2 h-12">{plan.description}</p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-texto">
                  R${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-secundaria">/mês</span>
                )}
              </div>
              <ul className="mt-8 space-y-4 text-texto-claro flex-grow">
                {plan.features?.map((feature: string) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 shrink-0"
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
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/signup?planId=${plan.stripe_price_id || plan.id}`}
                className="mt-8 block w-full text-center font-bold py-3 px-6 rounded-lg bg-primaria text-white hover:bg-blue-800 transition-colors"
              >
                Contratar Plano
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
