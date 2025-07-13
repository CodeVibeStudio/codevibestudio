// src/app/api/contact/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { NewLeadEmail } from "@/components/NewLeadEmail";

// Inicializa o Resend com a chave de API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, projectDraft } = await req.json();

    // 1. Salvar os dados no Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { error: dbError } = await supabaseAdmin.from("propostas").insert({
      nome: name,
      telefone: phone,
      email: email,
      esboco_projeto: projectDraft,
    });

    if (dbError) {
      console.error("Erro ao salvar no Supabase:", dbError);
      // Mesmo se falhar em salvar no DB, tentamos enviar o e-mail para não perder o lead.
    }

    // 2. Enviar o e-mail de notificação usando Resend
    const { data, error: emailError } = await resend.emails.send({
      from: "CodeVibe Studio <onboarding@resend.dev>", // E-mail verificado no Resend. 'onboarding@resend.dev' é um remetente padrão para testes.
      to: ["codevibe.br@gmail.com"], // Seu e-mail para receber as notificações
      subject: "🚀 Nova Proposta de Projeto Recebida!",
      react: NewLeadEmail({ name, phone, email, projectDraft }), // Nosso componente de e-mail
    });

    if (emailError) {
      console.error("Erro ao enviar e-mail com Resend:", emailError);
      throw new Error("Falha ao enviar e-mail de notificação.");
    }

    console.log("E-mail enviado com sucesso!", data);

    return NextResponse.json({
      message: "Contato recebido e notificação enviada com sucesso!",
    });
  } catch (error) {
    console.error("Erro na API de contato:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar o contato." },
      { status: 500 }
    );
  }
}
