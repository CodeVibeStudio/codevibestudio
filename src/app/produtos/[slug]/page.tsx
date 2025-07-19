// src/app/produtos/[slug]/page.tsx

import OrcamentoButton from "@/components/OrcamentoButton";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

// Import the secure HTML renderer component we created
import SecureHtmlRenderer from "@/components/SecureHtmlRenderer";

// --- Data Types ---
type ProductStatus = "Em Produção" | "Em Desenvolvimento" | "Projeto Futuro";

type Product = {
  id: number;
  name: string;
  slogan: string;
  description: string;
  logo_url: string;
  contact_form: boolean;
  status: ProductStatus | null;
  meta_title: string | null;
  meta_description: string | null;
};

type Plan = {
  id: number;
  name: string;
  price: number;
  features: string[];
  is_featured: boolean;
};

// --- Function to generate dynamic metadata for SEO (Maintained 100%) ---
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const siteUrl = "https://codevibestudio.vercel.app";

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

  const pageTitle = product.meta_title || product.name;
  const pageDescription =
    product.meta_description ||
    product.slogan ||
    product.description.substring(0, 155);
  const imageUrl = product.logo_url || `${siteUrl}/social-card.png`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
  };
}

// --- Function to generate static pages (Maintained 100%) ---
export async function generateStaticParams() {
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .not("slug", "is", null);

  if (!products) return [];

  return products.map((product) => ({ slug: product.slug }));
}

// --- Plan Card Component (Maintained 100%) ---
function PlanCard({ plan, productSlug }: { plan: Plan; productSlug: string }) {
  const signupUrl = `/signup?plan=${plan.name.toLowerCase()}&product=${productSlug}`;

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      {plan.is_featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          R${plan.price.toFixed(2)}
          <span className="text-lg font-normal text-gray-600">/mês</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-4 h-4 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={signupUrl}
        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {plan.price > 0 ? "Experimentar 15 dias grátis" : "Começar Agora"}
      </Link>
    </div>
  );
}

// --- Function to fetch product data (Maintained 100%) ---
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

// --- Main Page Component ---
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
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Product Header */}
          <div className="text-center mb-12">
            {product.logo_url && (
              <div className="mb-6">
                <Image
                  src={product.logo_url}
                  alt={`${product.name} logo`}
                  width={120}
                  height={120}
                  className="mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">
                {product.name}
              </h1>
              {product.status && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${badgeStyle}`}
                >
                  {product.status}
                </span>
              )}
            </div>

            <p className="text-xl text-gray-600 mb-8">{product.slogan}</p>

            {/* MAIN CHANGE: Replace simple dangerouslySetInnerHTML with secure component */}
            <div className="prose prose-lg max-w-none mx-auto text-gray-700 mb-8">
              <SecureHtmlRenderer dirtyHtml={product.description} />
            </div>
          </div>

          {/* Contact Form Button - only show if product has contact_form enabled */}
          {product.contact_form && (
            <div className="text-center mb-12">
              <OrcamentoButton productName={product.name} />
            </div>
          )}

          {/* Pricing Plans */}
          {plans.length > 0 && (
            <section className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Nossos Planos
                </h2>
                <p className="text-lg text-gray-600">
                  Escolha o plano ideal para as suas necessidades
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    productSlug={params.slug}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6">
                Junte-se a milhares de utilizadores satisfeitos
              </p>

              {plans.length > 0 ? (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={`/signup?plan=${plan.name.toLowerCase()}&product=${params.slug}`}
                      className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mr-4 mb-2"
                    >
                      Começar com {plan.name} - R${plan.price.toFixed(2)}/mês
                    </Link>
                  ))}
                </div>
              ) : product.contact_form ? (
                <OrcamentoButton productName={product.name} />
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">{product.slogan}</p>
                  {/* Render the product description securely */}
                  <div className="prose prose-sm max-w-none mx-auto text-gray-700">
                    <SecureHtmlRenderer dirtyHtml={product.description} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
