// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// IMPORTANTE: Este pacote precisa de ser instalado.
// Execute no terminal: npm install @supabase/auth-helpers-nextjs
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

// --- Tipos de Dados ---
type Product = {
  id: number;
  name: string;
  description: string;
  logo_url: string;
};

type SubscriptionWithProduct = {
  id: number;
  status: "active" | "trialing" | "incomplete" | "canceled";
  plano: string;
  products: Product | null;
};

// --- Componente Principal da Página ---
export default function DashboardPage() {
  const router = useRouter();
  // Cria um cliente Supabase específico para Componentes de Cliente
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push("/login");
          return;
        }
        setUser(session.user);

        console.log("A procurar empresa para o utilizador:", session.user.id);
        const { data: empresaData, error: empresaError } = await supabase
          .from("empresas")
          .select("id")
          .eq("owner_id", session.user.id)
          .single();

        if (empresaError) {
          console.error("Erro do Supabase ao buscar empresa:", empresaError);
          throw new Error(
            `Falha ao carregar dados da empresa. Verifique as políticas de RLS. (Código: ${empresaError.code})`
          );
        }

        if (!empresaData) {
          console.error(
            "Nenhuma empresa encontrada para o utilizador:",
            session.user.id
          );
          throw new Error(
            "Não foi possível encontrar uma empresa associada a este utilizador."
          );
        }

        console.log("Empresa encontrada:", empresaData.id);

        const { data: subsData, error: subsError } = await supabase
          .from("subscriptions")
          .select(
            `id, status, plano, products (id, name, description, logo_url)`
          )
          .eq("empresa_id", empresaData.id)
          .in("status", ["active", "trialing"]);

        if (subsError) {
          console.error("Erro do Supabase ao buscar subscrições:", subsError);
          throw new Error(
            `Falha ao carregar os seus dados de subscrição. (Código: ${subsError.code})`
          );
        }

        console.log("Subscrições encontradas:", subsData);
        setSubscriptions(subsData as SubscriptionWithProduct[]);
      } catch (e: any) {
        console.error("Erro final no carregamento do painel:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Meu Painel</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden md:block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          )}
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          Meus Produtos Ativos
        </h2>

        {error && (
          <div className="rounded-md bg-red-100 p-4 text-center">
            <p className="font-bold text-red-700">Ocorreu um Erro</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!error && subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* ... o seu código para renderizar os cartões de subscrição ... */}
          </div>
        ) : (
          !error && (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-xl text-gray-700">
                Você ainda não tem nenhum produto ativo.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
              >
                Explorar Produtos
              </Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}
