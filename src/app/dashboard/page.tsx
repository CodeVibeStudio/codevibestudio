// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Obter a sessão do utilizador atual
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // Se não houver sessão, redireciona para o login
        router.push("/login");
        return;
      }
      setUser(session.user);

      try {
        // 2. Buscar a empresa associada a este utilizador
        // A segurança (RLS) garante que o utilizador só pode ver a sua própria empresa.
        const { data: empresaData, error: empresaError } = await supabase
          .from("empresas")
          .select("id")
          .eq("owner_id", session.user.id)
          .single();

        if (empresaError || !empresaData) {
          throw new Error(
            "Não foi possível encontrar uma empresa associada a este utilizador."
          );
        }

        // 3. Buscar as subscrições ativas ou em trial desta empresa,
        //    juntando os dados do produto relacionado.
        const { data: subsData, error: subsError } = await supabase
          .from("subscriptions")
          .select(
            `
            id,
            status,
            plano,
            products (id, name, description, logo_url)
          `
          )
          .eq("empresa_id", empresaData.id)
          .in("status", ["active", "trialing"]); // Filtra apenas por subscrições válidas

        if (subsError) {
          console.error("Erro ao buscar subscrições:", subsError);
          throw new Error(
            `Falha ao carregar os seus dados de subscrição. (${subsError.message})`
          );
        }

        setSubscriptions(subsData as SubscriptionWithProduct[]);
      } catch (e: any) {
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

  // --- Renderização ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">A carregar o seu painel...</p>
        </div>
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
          <p className="rounded-md bg-red-100 p-4 text-red-600">{error}</p>
        )}

        {!error && subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map(
              (sub) =>
                sub.products && (
                  <div
                    key={sub.id}
                    className="transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      {sub.products.logo_url && (
                        <Image
                          src={sub.products.logo_url}
                          alt={`Logo ${sub.products.name}`}
                          width={64}
                          height={64}
                          className="mb-4 rounded-lg"
                        />
                      )}
                      <h3 className="text-2xl font-bold text-gray-900">
                        {sub.products.name}
                      </h3>
                      <p className="mt-2 text-gray-600">
                        {sub.products.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Plano
                          </p>
                          <p className="text-lg font-bold capitalize">
                            {sub.plano}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Status
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${sub.status === "active" || sub.status === "trialing" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {sub.status === "trialing" ? "Em Teste" : "Ativo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
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
