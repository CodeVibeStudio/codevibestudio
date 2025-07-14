// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

// --- Tipos de Dados ---
type SubscriptionWithProduct = {
  id: number;
  status: string;
  plano: string;
  products: {
    id: number;
    name: string;
    description: string;
    logo_url: string;
  } | null;
};

// --- Componente Principal da Página ---
export default function DashboardPage() {
  const router = useRouter();
  // CORREÇÃO: Removido o sinal de igual duplo
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
      } = await supabase.auth.getSession();

      if (!session) {
        // Se não houver sessão, redireciona para o login
        router.push("/login");
        return;
      }
      setUser(session.user);

      try {
        // CORREÇÃO: Lógica de busca de dados em duas etapas

        // 2. Buscar a empresa associada a este utilizador
        const { data: empresaData, error: empresaError } = await supabase
          .from("empresas")
          .select("id")
          .eq("owner_id", session.user.id)
          .single();

        if (empresaError || !empresaData) {
          throw new Error(
            "Não foi possível encontrar a empresa associada a este utilizador."
          );
        }

        // 3. Buscar as assinaturas ativas ou em trial desta empresa
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
          .in("status", ["active", "trialing"]);

        if (subsError) {
          console.error("Erro ao buscar assinaturas:", subsError);
          throw new Error(
            `Falha ao carregar os seus dados de assinatura. (${subsError.message})`
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
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // --- Renderização ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">A carregar o seu painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Meu Painel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Sair
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Meus Produtos Ativos
        </h2>

        {error && (
          <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
        )}

        {!error && subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subscriptions.map(
              (sub) =>
                sub.products && (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform"
                  >
                    <div className="p-6">
                      <Image
                        src={sub.products.logo_url}
                        alt={`Logo ${sub.products.name}`}
                        width={64}
                        height={64}
                        className="rounded-lg mb-4"
                      />
                      <h3 className="text-2xl font-bold text-gray-900">
                        {sub.products.name}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {sub.products.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Plano
                          </p>
                          <p className="font-bold text-lg capitalize">
                            {sub.plano}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Status
                          </p>
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${sub.status === "active" || sub.status === "trialing" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
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
            <div className="text-center bg-white p-8 rounded-lg shadow">
              <p className="text-xl text-gray-700">
                Você ainda não tem nenhum produto ativo.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
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
