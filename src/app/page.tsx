"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, Instagram } from "lucide-react";

// --- DADOS DOS PROJETOS ---
const projects = [
  {
    name: "RescueNow",
    slogan: "O Controle na Palma da Sua Mão",
    description:
      "Sistema de gestão empresarial completo para simplificar suas operações, do financeiro aos clientes.",
    logoUrl: "/rescuenow.jpg", // O caminho começa com '/' para indicar a pasta public
    link: "/produtos/rescuenow",
  },
  {
    name: "WordRope",
    slogan: "Desafie sua Mente, Palavra por Palavra",
    description:
      "Um jogo de palavras viciante que testa seu vocabulário e raciocínio rápido em um formato divertido.",
    logoUrl: "/wordrope.png",
    link: "#",
  },
  {
    name: "VetCare+",
    slogan: "Cuidando de Quem Sempre Cuida de Você",
    description:
      "Software de gestão para clínicas veterinárias, simplificando agendamentos, prontuários e faturamento.",
    logoUrl: "https://placehold.co/60x60/f57c00/FFFFFF?text=V", // Placeholder
    link: "#",
  },
  {
    name: "MeuTreino",
    slogan: "Sua Jornada Fitness, Personalizada",
    description:
      "Aplicativo para academias e personal trainers, facilitando a criação e acompanhamento de treinos.",
    logoUrl: "https://placehold.co/60x60/0D47A1/FFFFFF?text=M", // Placeholder
    link: "#",
  },
];

// --- COMPONENTES DA PÁGINA ---

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/">
          {/* O caminho da imagem agora está correto */}
          <Image
            src="/codevibestudio.jpg"
            alt="Logo CodeVibe Studio"
            width={50}
            height={50}
            className="rounded-md"
          />
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="#projetos"
            className="text-texto-claro hover:text-secundaria transition-colors"
          >
            Projetos
          </Link>
          <Link
            href="#sobre"
            className="text-texto-claro hover:text-secundaria transition-colors"
          >
            Sobre Nós
          </Link>
          {/* CORREÇÃO: Usando as classes de cor simplificadas */}
          <Link
            href="/produtos/rescuenow"
            className="bg-secundaria text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Conheça o RescueNow
          </Link>
        </div>
      </nav>
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
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
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
        <Link
          href={project.link}
          className="font-bold text-secundaria hover:text-orange-600 transition-colors"
        >
          Saber mais &rarr;
        </Link>
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <section id="projetos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-texto">Nossos Projetos</h2>
          <p className="text-lg text-texto-claro mt-2">
            Um ecossistema de soluções para diferentes necessidades.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
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

function Footer() {
  const socialLinks = [
    {
      icon: MessageCircle,
      href: "https://wa.me/5532998111973",
      label: "WhatsApp",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/codevibestudio",
      label: "Instagram",
    },
    { icon: Mail, href: "mailto:codevibe.br@gmail.com", label: "Email" },
  ];

  return (
    <footer className="bg-texto text-white py-12">
      <div className="container mx-auto px-6 text-center">
        <Image
          src="/codevibestudio.jpg"
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
      <AboutSection />
      <Footer />
    </main>
  );
}
