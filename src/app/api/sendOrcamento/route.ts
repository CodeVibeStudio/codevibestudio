// src/app/api/sendOrcamento/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin"; // Usamos o cliente admin para escrever no DB
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { produto_nome, nome_completo, whatsapp, resumo_projeto } =
    await req.json();

  if (!produto_nome || !nome_completo || !whatsapp || !resumo_projeto) {
    return NextResponse.json(
      { error: "Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  // 1. Salvar o pedido no Supabase
  const { error: dbError } = await supabaseAdmin.from("orcamentos").insert({
    produto_nome,
    nome_completo,
    whatsapp,
    resumo_projeto,
  });

  if (dbError) {
    console.error("Erro ao salvar orçamento no Supabase:", dbError);
    // Mesmo que falhe, tentamos enviar o e-mail como fallback
  }

  // 2. Enviar o e-mail de notificação
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // ex: "smtp.titan.email"
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465", // true para porta 465
      auth: {
        user: process.env.SMTP_USER, // seu e-mail
        pass: process.env.SMTP_PASS, // sua senha de app
      },
    });

    await transporter.sendMail({
      from: `"Codevibe Studio" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_RECIPIENT, // O e-mail que receberá os pedidos
      subject: `Novo Pedido de Orçamento: ${produto_nome}`,
      html: `
        <h1>Novo Pedido de Orçamento Recebido</h1>
        <p><strong>Produto:</strong> ${produto_nome}</p>
        <hr>
        <p><strong>Nome Completo:</strong> ${nome_completo}</p>
        <p><strong>Whatsapp:</strong> ${whatsapp}</p>
        <p><strong>Resumo do Projeto:</strong></p>
        <p>${resumo_projeto}</p>
      `,
    });

    return NextResponse.json({ message: "Pedido enviado com sucesso!" });
  } catch (emailError) {
    console.error("Erro ao enviar e-mail de orçamento:", emailError);
    return NextResponse.json(
      { error: "Ocorreu um erro ao enviar o seu pedido." },
      { status: 500 }
    );
  }
}
