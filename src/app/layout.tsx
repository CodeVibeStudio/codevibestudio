import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configuração da fonte Inter do Google Fonts
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeVibe Studio - Soluções Digitais Inovadoras",
  description: "Desenvolvemos sistemas e sites modernos para alavancar o seu negócio. Conheça o RescueNow, nosso sistema de gestão empresarial.",
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
