// src/app/recuperar-senha/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const response = await fetch('/api/auth/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
    } else {
      setError(data.error || 'Ocorreu um erro. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="text-gray-600">Insira o seu e-mail para receber um link de recuperação.</p>
        </div>

        {message ? (
          <div className="p-4 text-center text-green-800 bg-green-100 border border-green-200 rounded-md">
            <p>{message}</p>
            <Link href="/login" className="font-bold text-blue-600 hover:underline mt-2 block">
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? 'A enviar...' : 'Enviar Link de Recuperação'}
              </button>
            </div>
            <div className="text-center">
              <Link href="/login" className="font-medium text-sm text-blue-600 hover:text-blue-500">
                Lembrou-se da senha? Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}