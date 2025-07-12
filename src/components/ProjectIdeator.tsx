// src/components/ProjectIdeator.tsx

import { useState } from 'react';
import { Sparkles, Send, LoaderCircle, CheckCircle } from 'lucide-react';

// Estados possíveis da UI
type Status = 'idle' | 'loading' | 'success' | 'error' | 'contact';

export function ProjectIdeator() {
  const [idea, setIdea] = useState('');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  
  // Estados do formulário de contato
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleGenerateDraft = async () => {
    if (!idea.trim()) {
      setError('Por favor, descreva sua ideia primeiro.');
      return;
    }
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/ideator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Não foi possível gerar o esboço.');
      }

      const data = await response.json();
      setDraft(data.draft);
      setStatus('contact'); // Muda para a tela de contato
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: contactName,
                phone: contactPhone,
                email: contactEmail,
                projectDraft: draft
            }),
        });

        if (!response.ok) {
            throw new Error('Falha ao enviar o contato.');
        }

        setStatus('success');
    } catch (err: any) {
        setError(err.message);
        setStatus('error');
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center p-8">
            <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primaria" />
            <p className="mt-4 text-texto-claro">Nossa IA está elaborando seu projeto... Isso pode levar alguns segundos.</p>
          </div>
        );
      case 'success':
        return (
            <div className="text-center p-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-2xl font-bold text-texto">Contato Enviado!</h3>
                <p className="mt-2 text-texto-claro">Recebemos seu esboço de projeto. Entraremos em contato em breve para transformar sua ideia em realidade!</p>
            </div>
        );
      case 'contact':
        return (
            <div>
                <h3 className="text-2xl font-bold text-texto mb-4">Esboço do seu Projeto:</h3>
                <div className="bg-gray-100 p-4 rounded-lg mb-6 whitespace-pre-wrap font-mono text-sm text-texto-claro">{draft}</div>
                <h3 className="text-2xl font-bold text-texto mb-4">Gostou? Fale conosco!</h3>
                <p className="text-texto-claro mb-6">Preencha seus dados para que nossa equipe possa analisar seu projeto e entrar em contato.</p>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                    <input type="text" placeholder="Seu Nome" value={contactName} onChange={e => setContactName(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <input type="tel" placeholder="Seu Telefone (WhatsApp)" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <input type="email" placeholder="Seu E-mail" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <button type="submit" className="w-full bg-secundaria text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center">
                        <Send className="mr-2 h-5 w-5" /> Enviar para Análise
                    </button>
                </form>
            </div>
        );
      default: // idle or error
        return (
          <>
            <textarea
              className="w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primaria"
              placeholder="Ex: Preciso de um aplicativo para minha barbearia que permita aos clientes agendar horários, escolher o profissional e pagar online. Quero também um sistema de pontos de fidelidade."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <button
              onClick={handleGenerateDraft}
              className="mt-4 w-full bg-primaria text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
            >
              <Sparkles className="mr-2 h-5 w-5" /> Gerar Esboço do Projeto
            </button>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </>
        );
    }
  };

  return (
    <section id="ideator" className="py-20 bg-fundo">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-texto">Tem uma Ideia? Nós a Estruturamos.</h2>
          <p className="text-lg text-texto-claro mt-2 max-w-3xl mx-auto">
            Descreva sua necessidade ou a ideia do seu próximo grande projeto. Nossa IA assistente criará um esboço inicial para você em segundos.
          </p>
        </div>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          {renderContent()}
        </div>
      </div>
    </section>
  );
}
