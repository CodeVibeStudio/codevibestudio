// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      setError("Acesso negado.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("E-mail ou senha de administrador inválidos.");
    } else {
      router.refresh();
      // ** MUDANÇA: Redireciona para /admin **
      router.push("/admin");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Acesso Administrativo
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail do Administrador"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-500"
          >
            {loading ? "A verificar..." : "Entrar"}
          </button>
          {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  );
}
