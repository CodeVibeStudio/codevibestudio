// src/app/page.tsx
// Esta página é um Componente de Servidor, garantindo performance e evitando erros de hidratação.

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { ProjectIdeator } from "@/components/ProjectIdeator";
import { Mail, MessageCircle } from "lucide-react";
import ClientImage from "@/components/ClientImage";
import AnimatedBrandName from "@/components/AnimatedBrandName";
import { ProjectCard } from "@/components/ProjectCard"; // ALTERAÇÃO: Importa o novo componente

// Garante que a página seja sempre renderizada dinamicamente no servidor a cada requisição.
export const dynamic = "force-dynamic";

// --- Tipos de Dados ---
type ProductStatus = "Em Produção" | "Em Desenvolvimento" | "Projeto Futuro";

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
  status: ProductStatus | null;
};

// --- Componentes ---

function HeroSection() {
  return (
    // Fundo gradiente e overflow-hidden para a animação funcionar bem
    <section className="bg-gradient-to-r from-[#007BFF] to-[#FF6200] py-24 text-white overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        {/* Classes de animação adicionadas */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in-up hero-title-animation">
          Soluções Digitais que Pulsam Inovação! 🚀
        </h1>
        <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-up hero-subtitle-animation">
          De RJ a MG, transformamos suas ideias em apps, IA e sistemas com
          tecnologia de ponta, design vibrante e paixão por desafios. Vamos
          criar o futuro juntos? 💡✨
        </p>
        <div className="animate-fade-in-up hero-button-animation">
          <Link
            href="#projetos"
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-transform transform hover:scale-105"
          >
            Explore Nossos Projetos
          </Link>
        </div>
      </div>
    </section>
  );
}

// ALTERAÇÃO: A função ProjectCard foi movida para seu próprio arquivo em src/components/ProjectCard.tsx

function AboutSection() {
  return (
    <section id="sobre" className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-4xl font-bold text-gray-800 mb-4">
          Sobre a CodeVibe Studio
        </h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Bem-vindo à CodeVibe Studio, onde a inovação pulsa e as ideias ganham
          vida! Somos uma empresa de tecnologia apaixonada por criar aplicativos
          personalizados, sistemas inovadores e soluções de inteligência
          artificial (IA) que transformam negócios e inspiram o futuro. Fundada
          por Fábio Boscarino, nossa jornada começou nas vibrantes ruas do Rio
          de Janeiro e floresceu em Minas Gerais, trazendo uma energia única do
          litoral ao interior. Com um toque criativo e uma abordagem moderna,
          desenvolvemos soluções tecnológicas sob medida, desde apps intuitivos
          até sistemas robustos e IA que otimizam processos. Nossa paleta
          vibrante — combinando o dinamismo do Azul Elétrico e a energia da
          Laranja Vibrante — reflete nossa essência: inovação com alma. Cada
          projeto é um código vivo, pulsando com a vibe da tecnologia de ponta.
          Por que escolher a CodeVibe Studio? Expertise Personalizada:
          Aplicativos e sistemas desenhados para o seu sucesso. Inovação em IA:
          Soluções inteligentes que antecipam o futuro. Compromisso Local:
          Tecnologia com raízes brasileiras, do RJ a MG. Pronto para transformar
          sua ideia em realidade? Entre em contato e vamos criar algo incrível
          juntos! 🚀
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
    {" "}
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />{" "}
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />{" "}
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />{" "}
  </svg>
);
function Footer() {
  const socialLinks = [
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
          src="/social-card.png"
          alt="Logo CodeVibe Studio"
          width={100}
          height={100}
          className="rounded-md mx-auto mb-4"
        />
        <p className="text-gray-400 mb-6">
          {" "}
          "Transformando ideias em realidade digital."{" "}
        </p>
        <div className="flex justify-center space-x-6 mb-8">
          {" "}
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              {" "}
              <link.icon size={28} />{" "}
            </a>
          ))}{" "}
        </div>
        <p className="text-gray-500 text-sm">
          {" "}
          &copy; {new Date().getFullYear()} CodeVibe Studio. Todos os direitos
          reservados.{" "}
        </p>
      </div>
    </footer>
  );
}

// --- Página Principal ---
export default async function HomePage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*, status");

  if (error) {
    console.error("Erro ao buscar produtos:", error.message);
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
            Detalhe do erro: {error.message}
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  const statusOrder: ProductStatus[] = [
    "Em Produção",
    "Em Desenvolvimento",
    "Projeto Futuro",
  ];
  const sortedProducts = products
    ? [...products].sort((a, b) => {
        const statusA = a.status || "";
        const statusB = b.status || "";
        const indexA = statusOrder.indexOf(statusA as ProductStatus);
        const indexB = statusOrder.indexOf(statusB as ProductStatus);

        const effectiveIndexA = indexA === -1 ? Infinity : indexA;
        const effectiveIndexB = indexB === -1 ? Infinity : indexB;

        if (effectiveIndexA !== effectiveIndexB) {
          return effectiveIndexA - effectiveIndexB;
        }

        return a.name.localeCompare(b.name);
      })
    : [];

  const saasProjects = sortedProducts.filter((p) => p.type === "saas");
  const appProjects = sortedProducts.filter((p) => p.type === "app");

  return (
    <main className="bg-gray-100">
      <Header />
      <HeroSection />
      <section id="projetos" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          {saasProjects.length === 0 && appProjects.length === 0 ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Nossos Projetos
              </h2>
              <p className="text-gray-600">
                Nenhum projeto encontrado. Volte em breve!
              </p>
            </div>
          ) : (
            <>
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
                      <ProjectCard key={p.id} project={p as Product} />
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
                      <ProjectCard key={p.id} project={p as Product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <ProjectIdeator />
      <AboutSection />
      <Footer />
    </main>
  );
}
