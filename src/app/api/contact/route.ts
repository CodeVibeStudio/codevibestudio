// src/app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, projectDraft } = await req.json();

    // Log para verificar se os dados estão chegando corretamente
    console.log('--- NOVO LEAD RECEBIDO ---');
    console.log('Nome:', name);
    console.log('Telefone:', phone);
    console.log('E-mail:', email);
    console.log('Esboço do Projeto:', projectDraft);
    console.log('--------------------------');

    // TODO: Lógica de envio de e-mail
    // Aqui você integraria um serviço como Resend, SendGrid ou Nodemailer
    // para enviar um e-mail para 'codevibe.br@gmail.com' com os dados acima.
    // Por enquanto, apenas retornamos sucesso.

    return NextResponse.json({ message: 'Contato recebido com sucesso!' });

  } catch (error) {
    console.error('Erro na API de contato:', error);
    return NextResponse.json({ error: 'Ocorreu um erro ao processar o contato.' }, { status: 500 });
  }
}
