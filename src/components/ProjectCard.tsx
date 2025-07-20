// src/components/ProjectCard.tsx
"use client";

import Link from "next/link";
import ClientImage from "@/components/ClientImage";
import dynamic from "next/dynamic";

const SecureHtmlRenderer = dynamic(
  () => import("@/components/SecureHtmlRenderer"),
  {
    ssr: false,
    loading: () => <p className="text-gray-600 text-sm">Carregando...</p>,
  }
);

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
  const isSaaS = project.type === "saas";
  const statusStyles: { [key in ProductStatus]: string } = {
    "Em Produção": "bg-green-100 text-green-800",
    "Em Desenvolvimento": "bg-blue-100 text-blue-800",
    "Projeto Futuro": "bg-purple-100 text-purple-800",
  };

  const renderButtons = () => {
    if (project.status !== "Em Produção") {
      return (
        <Link
          href={project.slug ? `/produtos/${project.slug}` : "#"}
          // ▼▼▼ ALTERAÇÃO: Trocado 'justify-center' por 'text-center' ▼▼▼
          className="flex-1 flex items-center text-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Saiba mais...
        </Link>
      );
    }
    const hasPlans = isSaaS && project.slug;
    const hasAppLink = !!project.app_link;
    const hasWebLink = !!project.web_link;

    if (!hasPlans && !hasAppLink && !hasWebLink) {
      return (
        <Link
          href={project.slug ? `/produtos/${project.slug}` : "#"}
          // ▼▼▼ ALTERAÇÃO: Trocado 'justify-center' por 'text-center' ▼▼▼
          className="flex-1 flex items-center text-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Saiba mais...
        </Link>
      );
    }
    return (
      <>
        {hasPlans && (
          <Link
            href={`/produtos/${project.slug}`}
            // ▼▼▼ ALTERAÇÃO: Trocado 'justify-center' por 'text-center' ▼▼▼
            className="flex-1 flex items-center text-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ver Planos
          </Link>
        )}

        {hasWebLink && (
          <a
            href={project.web_link!}
            target="_blank"
            rel="noopener noreferrer"
            // ▼▼▼ ALTERAÇÃO: Trocado 'justify-center' por 'text-center' ▼▼▼
            className="flex-1 flex items-center text-center bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Acessar Web
          </a>
        )}

        {hasAppLink && (
          <a
            href={project.app_link!}
            target="_blank"
            rel="noopener noreferrer"
            // ▼▼▼ ALTERAÇÃO: Trocado 'justify-center' por 'text-center' ▼▼▼
            className="flex-1 flex items-center text-center bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Baixar App
          </a>
        )}
      </>
    );
  };

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
                  statusStyles[project.status] || "bg-gray-100 text-gray-800"
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
        <SecureHtmlRenderer content={project.description} />
      </div>
      <div className="p-6 mt-auto bg-gray-50 border-t">
        <div className="flex flex-col sm:flex-row gap-3">{renderButtons()}</div>
      </div>
    </div>
  );
}
