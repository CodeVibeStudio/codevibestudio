// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Ícones para o botão

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NOVO: Estado para visibilidade da senha
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("E-mail ou senha inválidos.");
    } else {
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Acesso à Plataforma
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Faça login para aceder aos seus produtos.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />
          {/* NOVO: Campo de senha com botão de visibilidade */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border p-3 pr-10" // Adiciona padding à direita para o ícone
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* NOVO: Link para recuperação de senha */}
          <div className="text-right text-sm">
            <Link
              href="/recuperar-senha"
              className="font-medium text-blue-600 hover:underline"
            >
              Esqueceu a sua senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Aguarde..." : "Entrar"}
          </button>
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="font-bold text-blue-600 hover:underline"
          >
            Crie uma agora
          </Link>
        </p>
      </div>
    </div>
  );
}
