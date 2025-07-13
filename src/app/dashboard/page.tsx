// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Usaremos os mesmos tipos que já definimos antes
type Product = { id: number; name: string; logo_url: string; };
type Subscription = { id: number; status: string; products: Product };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login'); // Se não houver sessão, volta para o login
        return;
      }
      
      setUser(session.user);

      // Busca as assinaturas ativas do usuário logado e os detalhes do produto associado
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          products ( id, name, logo_url )
        `)
        .eq('empresa_id', session.user.id) // Filtra pelo ID do usuário
        .in('status', ['active', 'trialing']); // Apenas assinaturas ativas ou em teste

      if (error) {
        console.error('Erro ao buscar assinaturas:', error);
      } else if (data) {
        setSubscriptions(data as any);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar seu painel...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800">Sair</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold mb-4">Meus Produtos Ativos</h2>
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map(sub => (
                <div key={sub.id} className="bg-white overflow-hidden shadow rounded-lg p-5">
                  <div className="flex items-center">
                    <img src={sub.products.logo_url} alt={sub.products.name} className="h-12 w-12 rounded-md"/>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{sub.products.name}</h3>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {sub.status === 'trialing' ? 'Em Teste' : 'Ativo'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="#" className="w-full text-center block bg-primaria text-white font-bold py-2 rounded-lg">Aceder à Plataforma</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Você ainda não tem nenhum produto ativo.</p>
          )}
        </div>
      </main>
    </div>
  );
}
