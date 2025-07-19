// src/components/ProjectCard.tsx
"use client";

import Link from "next/link";
import ClientImage from "@/components/ClientImage";
import dynamic from "next/dynamic"; // <<< ALTERAÇÃO: Importa o 'dynamic'

// ▼▼▼ ALTERAÇÃO: Carrega o renderizador dinamicamente ▼▼▼
const SecureHtmlRenderer = dynamic(
  () => import("@/components/SecureHtmlRenderer"),
  {
    ssr: false, // Garante que nunca seja renderizado no servidor
    loading: () => <p className="text-gray-600 text-sm">Carregando...</p>,
  }
);
// ▲▲▲ FIM DA ALTERAÇÃO ▲▲▲

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

// --- Componente ---
export function ProjectCard({ project }: { project: Product }) {
  // ...toda a lógica do componente permanece a mesma...
  const isSaaS = project.type === "saas";
  // ...

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex items-start mb-4">
          <ClientImage
            src={project.logo_url}
            alt={`Logo ${project.name}`}
            width={60}
            height={60}
            className="rounded-lg object-cover mr-4"
            fallbackText={project.name.charAt(0)}
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{project.name}</h3>
            {project.status && (
              <span
                className={`text-xs font-medium mt-1 px-2.5 py-0.5 rounded-full inline-block ${
                  project.status === "Em Produção"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {project.status}
              </span>
            )}
          </div>
          <span
            className={`px-3 py-1 text-xs font-bold text-white rounded-full self-start ${
              isSaaS ? "bg-blue-600" : "bg-green-600"
            }`}
          >
            {isSaaS ? "SaaS" : "App"}
          </span>
        </div>
        <p className="font-semibold text-blue-500 mb-3">{project.slogan}</p>

        {/* O SecureHtmlRenderer agora é carregado dinamicamente */}
        <SecureHtmlRenderer content={project.description} />
      </div>
      <div className="p-6 mt-auto bg-gray-50 border-t">
        {/* ...botões... */}
      </div>
    </div>
  );
}
