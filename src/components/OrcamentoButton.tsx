"use client";

import { useRouter } from "next/navigation";

export default function OrcamentoButton({ productName }: { productName: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/orcamento?produto=" + productName)}
      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 mt-6"
    >
      Solicitar Orçamento
    </button>
  );
}
