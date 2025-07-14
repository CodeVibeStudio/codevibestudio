// src/app/signup/page.tsx
"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// O formulário agora é um componente separado para usar o hook 'useSearchParams'
function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planName = searchParams.get("plan") || "starter";
  const productSlug = searchParams.get("product");

  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se o slug do produto não estiver na URL, exibe um erro.
  useEffect(() => {
    if (!productSlug) {
      setError(
        "Produto não especificado. Por favor, volte e selecione um plano."
      );
    } else {
      setError(null); // Limpa o erro se o slug for encontrado
    }
  }, [productSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!empresa || !email || !password || !productSlug) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa,
          email,
          password,
          plan: planName,
          productSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ocorreu um erro no servidor.");
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setError("Não foi possível obter o URL de redirecionamento.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Crie a sua Conta
        </h2>
        <p className="text-center text-gray-600">
          Plano selecionado:{" "}
          <span className="font-bold capitalize">{planName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="empresa"
              className="block text-sm font-medium text-gray-700"
            >
              Nome da Empresa
            </label>
            <input
              type="text"
              id="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Seu Melhor E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Crie uma Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !productSlug}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "A processar..." : "Criar Conta e Continuar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}

// Usamos o Suspense para lidar com o carregamento dos parâmetros da URL
export default function SignUpPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
