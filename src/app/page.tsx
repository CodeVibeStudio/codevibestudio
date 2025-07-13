"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, X } from "lucide-react";
import { ProjectIdeator } from "@/components/ProjectIdeator"; // IMPORTAÇÃO DO NOVO COMPONENTE

// --- DADOS DOS PROJETOS ---
const projects = [
  {
    name: "RescueNow",
    type: "saas",
    slogan: "O Controle na Palma da Sua Mão",
    description:
      "Sistema de gestão empresarial completo para simplificar suas operações, do financeiro aos clientes.",
    logoUrl: "/rescuenow.png",
    link: "/produtos/rescuenow",
  },
  {
    name: "VetCare+",
    type: "saas",
    slogan: "Cuidando de Quem Sempre Cuida de Você",
    description:
      "Software de gestão para clínicas veterinárias, simplificando agendamentos, prontuários e faturamento.",
    logoUrl: "/logovetecare+.png",
    link: "#",
  },
  {
    name: "WordRope",
    type: "app",
    slogan: "Desafie sua Mente, Palavra por Palavra",
    description:
      "Um jogo de palavras viciante que testa seu vocabulário e raciocínio rápido em um formato divertido.",
    logoUrl: "/wordrope.png",
    link: "https://play.google.com/store/apps/details?id=com.codevibestudio.wordrope",
  },
  {
    name: "MeuTreino",
    type: "app",
    slogan: "Sua Jornada Fitness, Personalizada",
    description:
      "Aplicativo para academias e personal trainers, facilitando a criação e acompanhamento de treinos.",
    logoUrl: "/icone_meutreino.png",
    link: "https://meutreino-rose.vercel.app/dashboard",
  },
];

// --- COMPONENTES DA PÁGINA ---

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#projetos", label: "Projetos" },
    { href: "#ideator", label: "Gerador de Ideias" },
    { href: "#sobre", label: "Sobre Nós" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          {/* Caminho do logo corrigido para o que funcionou anteriormente */}
          <Image
            src="/codevibestudio.jpeg"
            alt="Logo CodeVibe Studio"
            width={50}
            height={50}
            className="rounded-md"
          />
        </Link>

        {/* Menu para Desktop (escondido em telas pequenas) */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-texto-claro hover:text-secundaria transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#projetos"
            className="bg-secundaria text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Nossas Soluções
          </Link>
        </div>

        {/* Botão do Menu Hambúrguer (visível apenas em telas pequenas) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Painel do Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg">
          <div className="flex flex-col items-center p-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-texto-claro hover:text-secundaria transition-colors w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)} // Fecha o menu ao clicar
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#projetos"
              className="bg-secundaria text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Nossas Soluções
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

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

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const isSaaS = project.type === "saas";
  const isExternal = project.link.startsWith("http");

  const LinkComponent = () => {
    const linkClasses =
      "font-bold text-secundaria hover:text-orange-600 transition-colors";
    const linkText = isSaaS ? "Ver Planos" : "Baixar App";

    if (isExternal) {
      return (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          {linkText} &rarr;
        </a>
      );
    }
    return (
      <Link href={project.link} className={linkClasses}>
        {linkText} &rarr;
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col relative">
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-3 py-1 text-xs font-bold text-white rounded-full ${
            isSaaS ? "bg-primaria" : "bg-green-600"
          }`}
        >
          {isSaaS ? "SaaS" : "App"}
        </span>
      </div>
      <div className="p-6">
        <Image
          src={project.logoUrl}
          alt={`Logo ${project.name}`}
          width={60}
          height={60}
          className="rounded-lg mb-4 object-cover"
        />
        <h3 className="text-2xl font-bold text-texto">{project.name}</h3>
        <p className="font-semibold text-primaria-light mb-3">
          {project.slogan}
        </p>
        <p className="text-texto-claro flex-grow">{project.description}</p>
      </div>
      <div className="p-6 mt-auto bg-gray-50">
        <LinkComponent />
      </div>
    </div>
  );
}

function ProjectsSection() {
  const saasProjects = projects.filter((p) => p.type === "saas");
  const appProjects = projects.filter((p) => p.type === "app");

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
              <ProjectCard key={project.name} project={project} />
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
              <ProjectCard key={project.name} project={project} />
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

// CORREÇÃO: Novo componente para o ícone do Instagram, usando SVG.
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
    // CORREÇÃO: Usando o novo componente InstagramIcon no lugar do ícone preterido.
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

export default function HomePage() {
  return (
    <main className="bg-fundo">
      <Header />
      <HeroSection />
      <ProjectsSection />
      {/* ADICIONAMOS A NOVA SEÇÃO AQUI */}
      <ProjectIdeator />
      <AboutSection />
      <Footer />
    </main>
  );
}
