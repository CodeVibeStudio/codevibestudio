import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configuração da fonte Inter do Google Fonts
const inter = Inter({ subsets: ["latin"] });

// Metadados otimizados para SEO
export const metadata: Metadata = {
  title: {
    template: "%s | CodeVibe Studio", // Adiciona "| CodeVibe Studio" ao título de cada página
    default: "CodeVibe Studio - Soluções Digitais Inovadoras", // Título padrão para a home page
  },
  description:
    "Transformamos ideias em realidade com SaaS, Apps e soluções digitais sob medida. Conheça nossos projetos e serviços de desenvolvimento.",
  keywords: [
    "SaaS",
    "Desenvolvimento de Apps",
    "Next.js",
    "Supabase",
    "Stripe",
    "CodeVibe Studio",
    "Software como Serviço",
    "Aplicativos Mobile",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* Aplica a fonte Inter e as cores de fundo e texto padrão
        definidas no tailwind.config.js e globals.css
      */}
      <body className={`${inter.className} bg-fundo text-texto antialiased`}>
        {children}
      </body>
    </html>
  );
}
