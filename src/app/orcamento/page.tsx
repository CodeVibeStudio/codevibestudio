// src/app/orcamento/page.tsx

// **MUDANÇA:** A página agora é um componente "wrapper" que usa Suspense.
// Todo o código que depende de hooks de cliente foi movido para um componente separado.

import { Suspense } from "react";
import OrcamentoForm from "@/components/OrcamentoForm"; // Vamos criar este componente

// Este é o componente da página principal. Ele é muito simples.
export default function OrcamentoPage() {
  return (
    // O Suspense mostra um fallback (ex: texto de carregamento) enquanto o conteúdo
    // do formulário (que depende do URL) não está pronto para ser renderizado.
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Suspense
        fallback={
          <div className="text-center font-semibold">
            A carregar formulário...
          </div>
        }
      >
        <OrcamentoForm />
      </Suspense>
    </div>
  );
}
