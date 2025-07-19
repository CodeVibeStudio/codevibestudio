// src/components/SecureHtmlRenderer.tsx
"use client";

import { useEffect, useState } from "react";
import type DOMPurify from "dompurify";

interface SecureHtmlRendererProps {
  content: string;
  className?: string;
}

const SecureHtmlRenderer = ({
  content,
  className = "",
}: SecureHtmlRendererProps) => {
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    if (content) {
      const sanitize = async () => {
        const DOMPurifyModule = (await import("dompurify")).default;

        // ▼▼▼ CORREÇÃO APLICADA AQUI ▼▼▼
        // Adicionamos 'style' à lista de atributos permitidos (ADD_ATTR).
        // Isso fará com que o DOMPurify não remova mais os estilos de cor e realce.
        const clean = DOMPurifyModule.sanitize(content, {
          USE_PROFILES: { html: true },
          ADD_ATTR: ["target", "style"],
        });
        // ▲▲▲ FIM DA CORREÇÃO ▲▲▲

        setSanitizedContent(clean);
      };
      sanitize();
    } else {
      setSanitizedContent("");
    }
  }, [content]);

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SecureHtmlRenderer;
