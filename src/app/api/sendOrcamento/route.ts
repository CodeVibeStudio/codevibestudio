// src/app/api/sendOrcamento/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin"; // Mantive seu import do admin client
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { produto_nome, nome_completo, whatsapp, resumo_projeto } =
      await req.json();

    // Validação de entrada
    if (!produto_nome || !nome_completo || !whatsapp || !resumo_projeto) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // 1. Tenta salvar o pedido no Supabase
    try {
      const { error: dbError } = await supabaseAdmin.from("orcamentos").insert({
        produto_nome,
        nome,
        whatsapp,
        resumo_projeto,
      });

      if (dbError) {
        // Apenas loga o erro e continua, conforme solicitado, para não impedir o envio do e-mail.
        console.error("Erro ao salvar orçamento no Supabase:", dbError.message);
      }
    } catch (dbException) {
      console.error(
        "Uma exceção ocorreu ao tentar salvar no Supabase:",
        dbException
      );
    }

    // 2. Configura e envia o e-mail de notificação
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      // `secure: true` para a porta 465, `false` para as outras (como 587, que usa STARTTLS)
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Sua senha de App do Gmail
      },
      // Opções adicionais para aumentar a confiabilidade em ambientes serverless
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Conteúdo do e-mail
    const mailOptions = {
      from: `"Codevibe Studio" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_RECIPIENT,
      subject: `Novo Pedido de Orçamento: ${produto_nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #333;">Novo Pedido de Orçamento Recebido</h1>
          <p><strong>Produto:</strong> ${produto_nome}</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <h2 style="color: #333;">Detalhes do Cliente</h2>
          <p><strong>Nome Completo:</strong> ${nome_completo}</p>
          <p><strong>Whatsapp:</strong> ${whatsapp}</p>
          <h2 style="color: #333;">Resumo do Projeto</h2>
          <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
            <p>${resumo_projeto.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Pedido enviado com sucesso!" });
  } catch (error: any) {
    // Captura qualquer erro que possa ocorrer, incluindo falhas no `req.json()` ou no envio do e-mail.
    console.error("ERRO GERAL NA API /api/sendOrcamento:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro interno ao processar o seu pedido.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
