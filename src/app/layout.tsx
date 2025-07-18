import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configuração da fonte Inter do Google Fonts
const inter = Inter({ subsets: ["latin"] });

// URL base do seu site (essencial para as meta tags)
const siteUrl = "https://codevibestudio.vercel.app";

// Metadados otimizados para SEO e redes sociais
export const metadata: Metadata = {
  title: {
    template: "%s | CodeVibe Studio",
    default: "CodeVibe - Soluções Digitais que Pulsam Inovação! 🚀",
  },
  description:
    "De RJ a MG, transformamos suas ideias em apps, IA e sistemas com tecnologia de ponta, design vibrante e paixão por desafios. Vamos criar o futuro juntos? 💡✨",
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

  // Metadados para Open Graph (LinkedIn, Facebook, WhatsApp)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "CodeVibe - Soluções Digitais que Pulsam Inovação! 🚀",
    description:
      "De RJ a MG, transformamos suas ideias em apps, IA e sistemas com tecnologia de ponta.",
    images: [
      {
        url: `${siteUrl}/social-card.png`, // Caminho para a sua imagem padrão
        width: 1200,
        height: 630,
        alt: "CodeVibe Studio",
      },
    ],
  },

  // Metadados para Twitter Cards (X)
  twitter: {
    card: "summary_large_image",
    title: "CodeVibe - Soluções Digitais que Pulsam Inovação! 🚀",
    description:
      "De RJ a MG, transformamos suas ideias em apps, IA e sistemas com tecnologia de ponta.",
    images: [`${siteUrl}/social-card.png`], // Caminho para a sua imagem padrão
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-fundo text-texto antialiased`}>
        {children}
      </body>
    </html>
  );
}
