// src/components/OrcamentoForm.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";

// Este componente contém toda a lógica do formulário que antes estava na página.
export default function OrcamentoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const produto = searchParams.get("produto") || "Serviço Personalizado";

  const [formData, setFormData] = useState({
    nome_completo: "",
    whatsapp: "",
    resumo_projeto: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await fetch("/api/sendOrcamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, produto_nome: produto }),
    });

    setLoading(false);

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/"), 3000); // Aumentado para 3s
    } else {
      setError("Ocorreu um erro ao enviar o seu pedido. Por favor, tente novamente.");
    }
  };

  if (success) {
    return (
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
            <h2 className="text-2xl font-semibold text-green-600">Pedido Enviado!</h2>
            <p className="mt-4 text-gray-700">O seu pedido de orçamento foi enviado com sucesso. Entraremos em contacto em breve!</p>
            <p className="mt-2 text-sm text-gray-500">A redirecionar para a página inicial...</p>
        </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md"
    >
      <h2 className="text-2xl font-semibold">
        Pedido de Orçamento: {produto}
      </h2>
      <p className="text-sm text-gray-600">Preencha os campos abaixo e a nossa equipa entrará em contacto.</p>
      
      <div>
          <label htmlFor="nome_completo" className="mb-1 block text-sm font-medium text-gray-700">Nome Completo</label>
          <input id="nome_completo" type="text" name="nome_completo" placeholder="Seu nome completo" required value={formData.nome_completo} onChange={handleChange} className="w-full rounded-md border p-2" />
      </div>

      <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
          <input id="whatsapp" type="text" name="whatsapp" placeholder="(XX) XXXXX-XXXX" required value={formData.whatsapp} onChange={handleChange} className="w-full rounded-md border p-2" />
      </div>

      <div>
          <label htmlFor="resumo_projeto" className="mb-1 block text-sm font-medium text-gray-700">Breve resumo do projeto</label>
          <textarea id="resumo_projeto" name="resumo_projeto" placeholder="Descreva o que precisa..." required value={formData.resumo_projeto} onChange={handleChange} rows={4} className="w-full rounded-md border p-2" />
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={loading} className="w-full rounded-md bg-green-600 p-2 text-white hover:bg-green-700 disabled:bg-gray-400">
        {loading ? "A enviar..." : "Enviar Pedido"}
      </button>
    </form>
  );
}
