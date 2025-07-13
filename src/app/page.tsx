// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { ProjectIdeator } from "@/components/ProjectIdeator";
import { Mail, MessageCircle } from "lucide-react";

// SOLUÇÃO: Força a página a ser renderizada dinamicamente no servidor a cada visita.
// Isto garante que os dados dos produtos são sempre os mais recentes.
export const dynamic = "force-dynamic";

// Tipos de dados
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

// --- COMPONENTES ---

function HeroSection() {
  return (
    <section className="bg-fundo py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-texto mb-4">
          Soluções Digitais Inovadoras
        </h2>
        <p className="text-xl text-texto-claro mb-8 max-w-3xl mx-auto">
          Transformamos ideias em realidade com tecnologia de ponta, design
          centrado no usuário e uma paixão por resolver problemas.
        </p>
        <Link
          href="#projetos"
          className="bg-primaria text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-800 transition-colors"
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <Image
            src={project.logo_url}
            alt={`Logo ${project.name}`}
            width={60}
            height={60}
            className="rounded-lg object-cover"
          />
          <span
            className={`px-3 py-1 text-xs font-bold text-white rounded-full ${
              isSaaS ? "bg-primaria" : "bg-green-600"
            }`}
          >
            {isSaaS ? "SaaS" : "App"}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-texto">{project.name}</h3>
        <p className="font-semibold text-primaria-light mb-3">
          {project.slogan}
        </p>
        <p className="text-texto-claro">{project.description}</p>
      </div>
      <div className="p-6 mt-auto bg-gray-50 border-t">
        <div className="flex flex-col sm:flex-row gap-3">
          {webLinkHref && (
            <Link
              href={webLinkHref}
              target={webLinkHref.startsWith("http") ? "_blank" : "_self"}
              className="flex-1 text-center bg-gray-200 text-texto font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isSaaS ? "Ver Planos" : "Acessar Web"}
            </Link>
          )}
          {project.app_link && (
            <a
              href={project.app_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-secundaria text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
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
  const saasProjects = products.filter((p) => p.type === "saas");
  const appProjects = products.filter((p) => p.type === "app");
  return (
    <section id="projetos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-texto">
              Softwares para Empresas (SaaS)
            </h2>
            <p className="text-lg text-texto-claro mt-2">
              Soluções robustas para otimizar a gestão do seu negócio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {saasProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-texto">
              Aplicativos e Jogos
            </h2>
            <p className="text-lg text-texto-claro mt-2">
              Experiências mobile criativas e envolventes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {appProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="sobre" className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-4xl font-bold text-texto mb-4">
          Sobre a CodeVibe Studio
        </h3>
        <p className="text-lg text-texto-claro max-w-3xl mx-auto">
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
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
    <footer id="contato" className="bg-texto text-white py-12">
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
              className="text-gray-400 hover:text-secundaria transition-colors"
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

// --- PÁGINA PRINCIPAL ---
export default async function HomePage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar produtos:", error.message);
  }

  return (
    <main className="bg-fundo">
      <Header />
      <HeroSection />
      <ProjectsSection products={products || []} />
      <ProjectIdeator />
      <AboutSection />
      <Footer />
    </main>
  );
}
