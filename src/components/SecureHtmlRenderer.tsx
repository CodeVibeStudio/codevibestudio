// src/components/SecureHtmlRenderer.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";

interface SecureHtmlRendererProps {
  content: string;
  className?: string;
}

const SecureHtmlRenderer = ({
  content,
  className = "",
}: SecureHtmlRendererProps) => {
  // CORREÇÃO: Memoizando o conteúdo sanitizado para evitar re-processamento desnecessário.
  const sanitizedContent = useMemo(() => {
    if (typeof window === "undefined") {
      // Retorna vazio no servidor para evitar erros com DOMPurify
      return "";
    }
    // Configuração robusta para permitir estilos inline de cor e background
    // que o Tiptap gera, ao mesmo tempo que protege contra XSS.
    return DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target"],
      // Permite estilos inline, crucial para as cores funcionarem.
      ALLOWED_STYLE_PROPS: ["color", "background-color", "text-align"],
    });
  }, [content]);

  if (!sanitizedContent) {
    return null;
  }

  // ADIÇÃO: Usando a classe 'prose' para aplicar os estilos de tipografia do Tailwind.
  // Isso resolve o problema de espaçamento de parágrafos e linhas.
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SecureHtmlRenderer;
