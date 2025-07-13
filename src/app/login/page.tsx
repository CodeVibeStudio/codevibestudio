    // src/app/login/page.tsx
    'use client';

    import { useState } from 'react';
    import { useRouter } from 'next/navigation';
    import { supabase } from '@/lib/supabase';
    import Link from 'next/link';

    export default function ClientLoginPage() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const router = useRouter();

      const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError('E-mail ou senha inválidos.');
        } else {
          // Redireciona para o dashboard do cliente após o login
          router.push('/dashboard'); 
        }
        setLoading(false);
      };

      return (
        <div className="min-h-screen bg-fundo flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-texto mb-2">Acesso à Plataforma</h1>
            <p className="text-center text-texto-claro mb-6">Faça login para aceder aos seus produtos.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border rounded-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primaria text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Aguarde...' : 'Entrar'}
              </button>
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </form>
            <p className="text-center text-sm text-secundaria mt-6">
                Não tem uma conta?{' '}
                <Link href="/signup" className="font-bold hover:underline">
                    Crie uma agora
                </Link>
            </p>
          </div>
        </div>
      );
    }
    