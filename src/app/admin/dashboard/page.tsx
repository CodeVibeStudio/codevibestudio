// src/app/admin/dashboard/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Protege a rota e verifica se é o admin
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return redirect('/admin/login')
  }

  // Busca todos os produtos para gestão
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 font-bold hover:bg-red-700">
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Gestão de Produtos</h2>
            <Link href="/admin/products/new" className="rounded-lg bg-indigo-600 px-5 py-2 font-bold hover:bg-indigo-700">
                + Novo Produto
            </Link>
        </div>
        
        <div className="overflow-x-auto rounded-lg bg-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Descrição</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products?.map((product) => (
                <tr key={product.id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium">{product.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-400">{product.type}</td>
                  <td className="max-w-sm truncate px-6 py-4 text-gray-400" title={product.description}>{product.description}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <a href="#" className="text-indigo-400 hover:text-indigo-300">Editar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
