// src/app/dashboard/page.tsx

// MUDANÇA: O caminho de importação foi atualizado para a nova estrutura.
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// O componente agora é async para usar o cliente de servidor
export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se não houver utilizador, redireciona para a página de login
  if (!user) {
    return redirect("/login");
  }

  // Busca a empresa do utilizador
  const { data: empresaData } = await supabase
    .from("empresas")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  // Se não encontrar empresa, mostra uma mensagem de erro
  if (!empresaData) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center text-red-500">
        Erro: Não foi possível encontrar uma empresa associada a este
        utilizador.
        <br />
        Verifique as suas políticas de segurança (RLS) para a tabela 'empresas'.
      </div>
    );
  }

  // Busca as subscrições da empresa
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("status, plano, products(name, description)")
    .eq("empresa_id", empresaData.id)
    .in("status", ["active", "trialing", "incomplete"]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Meu Painel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-12">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">Meus Produtos</h2>

        {subscriptions && subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub: any, index) => (
              <div
                key={index}
                className={`transform overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1 ${sub.status === "incomplete" ? "opacity-60" : ""}`}
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {sub.products.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Plano</p>
                      <p className="text-lg font-bold capitalize">
                        {sub.plano}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Status
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                          sub.status === "active" || sub.status === "trialing"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800 animate-pulse"
                        }`}
                      >
                        {sub.status === "trialing"
                          ? "Em Teste"
                          : sub.status === "active"
                            ? "Ativo"
                            : "Processando..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-xl text-gray-700">
              Você ainda não tem nenhum produto.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              Explorar Produtos
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
