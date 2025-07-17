// src/app/produtos/[slug]/page.tsx
import OrcamentoButton from "@/components/OrcamentoButton";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

// --- Tipos de Dados Atualizados ---
type ProductStatus = "Em Produção" | "Em Desenvolvimento" | "Projeto Futuro";

type Product = {
  id: number;
  name: string;
  slogan: string;
  description: string;
  logo_url: string;
  contact_form: boolean;
  status: ProductStatus | null;
  meta_title: string | null; // NOVO
  meta_description: string | null; // NOVO
};

type Plan = {
  id: number;
  name: string;
  price: number;
  features: string[];
  is_featured: boolean;
};

// ATUALIZADO: Função para gerar metadados dinâmicos para SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  // Busca os dados do produto, incluindo os novos campos de SEO
  const { data: product } = await supabase
    .from("products")
    .select("name, slogan, description, logo_url, meta_title, meta_description")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Produto Não Encontrado",
    };
  }

  // Lógica de fallback: Usa os campos de SEO se existirem, senão, usa os dados padrão.
  const pageTitle = product.meta_title || product.name;
  const pageDescription =
    product.meta_description ||
    product.slogan ||
    product.description.substring(0, 155);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: product.logo_url || "/default-logo.png", // Adicione uma imagem padrão se não houver logo
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// --- Função para gerar páginas estáticas (sem alteração) ---
export async function generateStaticParams() {
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .not("slug", "is", null);
  if (!products) return [];
  return products.map((product) => ({ slug: product.slug }));
}

// --- Componente do Cartão de Plano (sem alteração) ---
function PlanCard({ plan, productSlug }: { plan: Plan; productSlug: string }) {
  const signupUrl = `/signup?plan=${plan.name.toLowerCase()}&product=${productSlug}`;

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
        R${plan.price.toFixed(2)}
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
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>{" "}
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={signupUrl}
        className={`mt-auto w-full block font-bold py-3 px-8 rounded-lg text-lg transition-colors ${plan.is_featured ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
      >
        {plan.price > 0 ? "Experimentar 15 dias grátis" : "Começar Agora"}
      </Link>
    </div>
  );
}

// --- Função para buscar dados do produto (sem alteração) ---
const getProductData = async (slug: string) => {
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, slogan, description, logo_url, contact_form, status, meta_title, meta_description"
    )
    .eq("slug", slug)
    .single();

  if (error || !product) notFound();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("product_id", product.id)
    .order("price", { ascending: true });

  return { product: product as Product, plans: plans || [] };
};

// --- Componente Principal da Página (sem alteração) ---
export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { product, plans } = await getProductData(params.slug);

  const statusStyles: { [key in ProductStatus]: string } = {
    "Em Produção": "bg-green-100 text-green-800 border border-green-200",
    "Em Desenvolvimento": "bg-blue-100 text-blue-800 border border-blue-200",
    "Projeto Futuro": "bg-purple-100 text-purple-800 border border-purple-200",
  };

  const badgeStyle = product.status ? statusStyles[product.status] : "";

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-16">
        <section className="text-center mb-16">
          <Image
            src={
              product.logo_url ||
              "https://placehold.co/100x100/eee/ccc?text=Logo"
            }
            alt={`Logo ${product.name}`}
            width={100}
            height={100}
            className="rounded-2xl mx-auto mb-6 border-4 border-white shadow-lg"
          />
          <h1 className="text-5xl font-extrabold text-gray-900">
            {product.name}
          </h1>

          {product.status && (
            <div className="mt-4 flex justify-center">
              <span
                className={`text-sm font-bold px-4 py-1.5 rounded-full ${badgeStyle}`}
              >
                {product.status}
              </span>
            </div>
          )}

          <p className="text-xl text-gray-600 mt-4">{product.slogan}</p>
          <p className="max-w-3xl mx-auto text-lg text-gray-700 mt-4">
            {product.description}
          </p>

          {product.contact_form && (
            <div className="mt-8">
              <OrcamentoButton productName={product.name} />
            </div>
          )}
        </section>

        {plans.length > 0 && (
          <section>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              Nossos Planos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} productSlug={params.slug} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
