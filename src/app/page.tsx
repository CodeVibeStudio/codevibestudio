// src/app/page.tsx
"use client"; // SOLUÇÃO: Transforma este arquivo em um módulo de Client Component.

import { useState, useEffect } from "react"; // Hooks para estado e efeitos
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header"; // Supondo que você tenha este componente
import { ProjectIdeator } from "@/components/ProjectIdeator"; // Supondo que você tenha este componente
import { Mail, MessageCircle, LoaderCircle } from "lucide-react";

// --- DEFINIÇÃO DE TIPOS ---
type Product = {
  id: number;
  name: string;
  type: "saas" | "app";
  slogan: string;
  description: string;
  logo_url: string;
  web_link: string | null;
  app_link: string | null;
  slug: string | null;
};

// --- COMPONENTES DA PÁGINA (sem alterações na lógica interna) ---

function HeroSection() {
  return (
    <section className="bg-gray-900 py-24 text-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Soluções Digitais Inovadoras
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Transformamos ideias em realidade com tecnologia de ponta, design
          centrado no usuário e uma paixão por resolver problemas.
        </p>
        <Link
          href="#projetos"
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors"
        >
          Explore Nossos Projetos
        </Link>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Product }) {
  const isSaaS = project.type === "saas";
  const webLinkHref =
    isSaaS && project.slug ? `/produtos/${project.slug}` : project.web_link;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          {/* O onError agora funciona porque este é um Client Component */}
          <Image
            src={project.logo_url}
            alt={`Logo ${project.name}`}
            width={60}
            height={60}
            className="rounded-lg object-cover border border-gray-200"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/60x60/e2e8f0/4a5568?text=${project.name.charAt(0)}`;
            }}
          />
          <span
            className={`px-3 py-1 text-xs font-bold text-white rounded-full ${
              isSaaS ? "bg-blue-600" : "bg-green-600"
            }`}
          >
            {isSaaS ? "SaaS" : "App"}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{project.name}</h3>
        <p className="font-semibold text-blue-500 mb-3">{project.slogan}</p>
        <p className="text-gray-600 text-sm">{project.description}</p>
      </div>
      <div className="p-6 mt-auto bg-gray-50 border-t">
        <div className="flex flex-col sm:flex-row gap-3">
          {webLinkHref && (
            <Link
              href={webLinkHref}
              target={webLinkHref.startsWith("http") ? "_blank" : "_self"}
              className="flex-1 text-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isSaaS ? "Ver Planos" : "Acessar Web"}
            </Link>
          )}
          {project.app_link && (
            <a
              href={project.app_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Baixar App
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectsSection({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <section id="projetos" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Nossos Projetos
          </h2>
          <p className="text-gray-600">
            Nenhum projeto encontrado. Volte em breve!
          </p>
        </div>
      </section>
    );
  }
  const saasProjects = products.filter((p) => p.type === "saas");
  const appProjects = products.filter((p) => p.type === "app");
  return (
    <section id="projetos" className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        {saasProjects.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800">
                Softwares para Empresas (SaaS)
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Soluções robustas para otimizar a gestão do seu negócio.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {saasProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
        {appProjects.length > 0 && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800">
                Aplicativos e Jogos
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Experiências mobile criativas e envolventes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {appProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AboutSection() {
  /* ...código inalterado... */ return (
    <section id="sobre" className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-4xl font-bold text-gray-800 mb-4">
          Sobre a CodeVibe Studio
        </h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Somos um estúdio de desenvolvimento apaixonado por criar soluções que
          fazem a diferença. Combinamos design moderno com engenharia de
          software robusta para entregar produtos que não apenas funcionam, mas
          que encantam os usuários.
        </p>
      </div>
    </section>
  );
}
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
function Footer() {
  /* ...código inalterado... */ const socialLinks = [
    {
      icon: MessageCircle,
      href: "https://wa.me/5532998111973",
      label: "WhatsApp",
    },
    {
      icon: InstagramIcon,
      href: "https://instagram.com/codevibestudio",
      label: "Instagram",
    },
    { icon: Mail, href: "mailto:codevibe.br@gmail.com", label: "Email" },
  ];
  return (
    <footer id="contato" className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6 text-center">
        <Image
          src="/codevibestudiologo.png"
          alt="Logo CodeVibe Studio"
          width={70}
          height={70}
          className="rounded-md mx-auto mb-4"
        />
        <p className="text-lg font-bold mb-4">CodeVibe Studio</p>
        <p className="text-gray-400 mb-6">
          Transformando ideias em realidade digital.
        </p>
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <link.icon size={28} />
            </a>
          ))}
        </div>
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} CodeVibe Studio. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("products")
          .select("*")
          .order("name", { ascending: true });

        if (supabaseError) {
          // Se o Supabase retornar um erro, ele será capturado aqui.
          throw new Error(
            `Falha na consulta ao Supabase: ${supabaseError.message}`
          );
        }
        setProducts(data || []);
      } catch (e) {
        if (e instanceof Error) {
          console.error("Erro detalhado ao buscar produtos:", e.message);
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []); // O array vazio [] garante que a busca ocorra apenas uma vez.

  // Estado de Carregamento
  if (loading) {
    return (
      <main className="bg-gray-100 flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-700">
              Carregando projetos...
            </h2>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <main className="bg-gray-100">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Oops! Algo deu errado.
          </h2>
          <p className="text-gray-600">
            Não foi possível carregar os projetos no momento.
          </p>
          <p className="mt-4 p-2 bg-red-100 text-red-700 text-xs rounded">
            Detalhe do erro: {error}
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  // Estado de Sucesso
  return (
    <main className="bg-gray-100">
      <Header />
      <HeroSection />
      <ProjectsSection products={products} />
      <ProjectIdeator />
      <AboutSection />
      <Footer />
    </main>
  );
}
