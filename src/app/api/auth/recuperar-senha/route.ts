// src/app/api/auth/recuperar-senha/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email é obrigatório.' }, { status: 400 });
  }

  const supabase = createClient();
  // O redirectTo deve apontar para uma página onde o utilizador possa definir a nova senha.
  // O Supabase irá adicionar os tokens necessários a este URL.
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/nova-senha`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error.message);
    // Por segurança, não informe ao utilizador se o e-mail existe ou não.
    // A mensagem de sucesso é retornada mesmo em caso de erro para evitar enumeração de e-mails.
    return NextResponse.json({ message: 'Se o seu e-mail estiver registado, receberá um link de recuperação em breve.' });
  }

  return NextResponse.json({ message: 'Se o seu e-mail estiver registado, receberá um link de recuperação em breve.' });
}
