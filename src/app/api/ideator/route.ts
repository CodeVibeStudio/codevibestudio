// src/app/api/ideator/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Pega a chave de API das variáveis de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'A descrição da ideia é obrigatória.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prompt detalhado para guiar a IA
    const prompt = `
      Aja como um consultor de projetos de software experiente da empresa "CodeVibe Studio".
      Um cliente em potencial descreveu a seguinte ideia: "${idea}".

      Sua tarefa é analisar a ideia e criar um "Esboço de Projeto" conciso e bem estruturado.
      O esboço deve ser claro, profissional e fácil de entender para o cliente.
      O tom deve ser encorajador e competente.

      O esboço DEVE conter as seguintes seções, exatamente nesta ordem e com estes títulos em negrito:

      **Nome Sugerido para o Projeto:** (Sugira um nome criativo)

      **Objetivo Principal:** (Descreva o principal problema que o projeto resolve em uma frase)

      **Funcionalidades Essenciais:** (Liste de 3 a 5 funcionalidades chave em formato de bullet points. Ex: - Agendamento Online)

      **Público-Alvo:** (Descreva quem seriam os principais usuários do sistema)

      **Próximos Passos na CodeVibe:** (Termine com uma frase padrão: "Este é um excelente ponto de partida! O próximo passo seria uma reunião de alinhamento com nossa equipe para detalhar os requisitos e planejar o desenvolvimento.")

      Formate a resposta inteira como um texto simples, usando quebras de linha para separar as seções. Não use Markdown complexo além dos negritos nos títulos.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ draft: text });

  } catch (error) {
    console.error('Erro na API do Gemini:', error);
    return NextResponse.json({ error: 'Ocorreu um erro ao comunicar com a IA.' }, { status: 500 });
  }
}
