import Link from 'next/link';

// Componente para o Header/Navbar
function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primaria">CodeVibe Studio</h1>
        <div>
          <Link href="#produto" className="text-texto hover:text-primaria mr-4">Produto</Link>
          <Link href="#sobre" className="text-texto hover:text-primaria mr-4">Sobre Nós</Link>
          <Link href="/signup" className="bg-primaria text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Começar Agora
          </Link>
        </div>
      </nav>
    </header>
  );
}

// Componente para a seção Hero
function HeroSection() {
  return (
    <section className="bg-fundo py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-5xl font-extrabold text-texto mb-4">Soluções Digitais Inovadoras</h2>
        <p className="text-xl text-secundaria mb-8">Criamos tecnologia que impulsiona o crescimento e a eficiência do seu negócio.</p>
        <Link href="/produtos/rescuenow" className="bg-primaria text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors">
          Conheça o RescueNow
        </Link>
      </div>
    </section>
  );
}

// Componente para a seção do Produto
function ProductSection() {
  return (
    <section id="produto" className="py-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          {/* Placeholder para uma imagem ou ilustração do produto */}
          <div className="bg-gray-200 w-full h-80 rounded-lg flex items-center justify-center">
            <span className="text-secundaria">Imagem do Produto</span>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-12">
          <h3 className="text-4xl font-bold text-texto mb-3">RescueNow</h3>
          <p className="text-2xl text-primaria font-semibold mb-6">"O Controle na Palma da Sua Mão"</p>
          <p className="text-lg text-secundaria mb-6">
            RescueNow é um sistema de gestão empresarial completo, projetado para simplificar suas operações,
            desde o controle financeiro até o gerenciamento de clientes. Tudo em uma plataforma intuitiva e poderosa.
          </p>
          <Link href="/produtos/rescuenow" className="text-primaria font-bold text-lg hover:underline">
            Ver Planos e Preços &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

// Componente para a seção "Sobre Nós"
function AboutSection() {
  return (
    <section id="sobre" className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-4xl font-bold text-texto mb-4">Sobre a CodeVibe Studio</h3>
        <p className="text-lg text-secundaria max-w-3xl mx-auto">
          Somos um estúdio de desenvolvimento apaixonado por criar soluções que fazem a diferença.
          Combinamos design moderno com engenharia de software robusta para entregar produtos que não apenas funcionam,
          mas que encantam os usuários.
        </p>
      </div>
    </section>
  );
}

// Componente para o Footer
function Footer() {
  return (
    <footer className="bg-texto text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} CodeVibe Studio. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}


export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <ProductSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
