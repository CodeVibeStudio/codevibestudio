// src/app/signup/page.tsx
'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const planId = searchParams.get('planId') || 'starter';

  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!empresa || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, email, password, plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro no cadastro.');
      }

      if (data.redirectUrl === '/success') {
          router.push('/dashboard'); // Leva para o dashboard após cadastro gratuito
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // Redireciona para o Stripe
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fundo flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-texto mb-2">Crie sua Conta</h1>
        <p className="text-center text-secundaria mb-6">
          Plano selecionado: <span className="font-bold capitalize text-primaria">{planId}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="empresa" className="block text-sm font-medium text-secundaria mb-1">Nome da Empresa</label>
            <input type="text" id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaria" required />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-secundaria mb-1">Seu Melhor E-mail</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaria" required />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-secundaria mb-1">Crie uma Senha</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaria" required />
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primaria text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Processando...' : 'Criar Conta e Continuar'}
          </button>
        </form>
        <p className="text-center text-sm text-secundaria mt-6">
          Já tem uma conta? <Link href="/login" className="text-primaria hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <SignUpForm />
        </Suspense>
    );
}
