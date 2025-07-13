typescript
// src/app/produtos/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NextPage } from "next";

// Definir interfaces para tipagem
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  stripe_price_id?: string;
}

interface Product {
  id: string;
  name: string;
  slogan: string;
  description: string;
}

// Tipagem para os parâmetros da página
interface ProductPlansPageProps {
  params: { slug: string };
}

// Usar NextPage para tipar a página
const ProductPlansPage: NextPage<ProductPlansPageProps> = async ({ params }) => {
  const slug = params.slug;

  // Busca o produto
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, slogan, description")
    .eq("slug", slug)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Busca os planos do produto
  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("id, name, description, price, features, stripe_price_id")
    .eq("product_id", product.id)
    .order("price", { ascending: true });

  return (
    <div className="bg-fundo min-h-screen">
      <header className="py-6">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/codevibestudio.jpeg"
              alt="Logo CodeVibe Studio"
              width={60}
              height={60}
              className="rounded-md"
            />
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-texto">{product.name}</h1>
          <p className="text-2xl text-primaria font-semibold mt-2 mb-6">
            {product.slogan}
          </p>
          <p className="text-lg text-texto-claro">{product.description}</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(plans || []).map((plan: Plan) => {
            // Definir o planId de forma explícita
            const planId = plan.stripe_price_id ?? plan.id;
            // Construir a URL do href fora do template literal
            const signupUrl = "/signup?planId=" + planId;
            return (
              <div
                key={plan.id}
                className="border rounded-lg p-8 flex flex-col bg-white shadow-lg"
              >
                <h3 className="text-2xl font-bold text-texto">{plan.name}</h3>
                <p className="text-secundaria mt-2 h-12">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-5xl font-extrabold text-texto">
                    R${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-secundaria">/mês</span>
                  )}
                </div>
                <ul className="mt-8 space-y-4 text-texto-claro flex-grow">
                  {plan.features?.map((feature: string) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={signupUrl}
                  className="mt-8 block w-full text-center font-bold py-3 px-6 rounded-lg bg-primaria text-white hover:bg-blue-800 transition-colors"
                >
                  Contratar Plano
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ProductPlansPage;
```

// Mudanças no `page.tsx`:
//- **Construção do `href` Simplificada**: A URL do `href` foi movida para uma variável `signupUrl` construída com concatenação de strings (`"/signup?planId=" + planId`) em vez de um template literal. Isso evita qualquer problema potencial com o parser de template literals.
//- **Tipagem Mantida**: As interfaces `Plan`, `Product`, e `ProductPlansPageProps` foram preservadas, garantindo tipagem robusta.
//- **Estrutura Intacta**: O restante do código permanece idêntico, exceto pela mudança no `href`.

// 2. Corrigir `next.config.js` e Limpar Cache do Vercel
// O aviso sobre `experimental.esmExternals` indica que o Vercel ainda está detectando a configuração antiga, provavelmente devido ao cache de build. Vamos confirmar o `next.config.js` correto e fornecer instruções para limpar o cache:

<xaiArtifact artifact_id="bf928773-7c13-49eb-9134-86fb1f81bc3a" artifact_version_id="7d6170e2-0da4-42a3-9129-d11de4474390" title="next.config.js" contentType="text/javascript">
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Domínio do seu Supabase Storage
        protocol: "https",
        hostname: "vpkqvpzmiylfuwspccqw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/product-logos/**",
      },
      {
        // Domínio das imagens de placeholder
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
```

// Ações para `next.config.js`:
// - **Confirmar Configuração**: O código acima já removeu a seção `experimental`, como suger whippersnapper. Verifique se o arquivo no repositório reflete exatamente esse conteúdo.
// - **Limpar Cache do Vercel**:
//  1. No painel do Vercel, vá para o projeto correspondente.
//  2. Acesse a seção **Settings** > **General**.
//  3. Role até **Build Cache** e clique em **Clear Build Cache** (se disponível) ou force um novo deploy sem cache.
//  4. Alternativamente, adicione uma variável de ambiente no Vercel (em **Settings** > **Environment Variables**) chamada `VERCEL_FORCE_NO_BUILD_CACHE` com o valor `true` para forçar um build sem cache.

// #### 3. Testar o Build Localmente
// Antes de fazer o deploy, teste o build localmente para garantir que o erro de sintaxe foi resolvido:
```bash
npm run build
```
// Se o build local for bem-sucedido, o problema está isolado ao ambiente do Vercel, provavelmente devido ao cache.

// #### 4. Commit e Deploy
// 1. Atualize os arquivos no repositório:
   ```bash
   git add src/app/produtos/[slug]/page.tsx next.config.js
   git commit -m "Corrige sintaxe no href do page.tsx e remove experimental.esmExternals"
   git push
   ```
// 2. Faça um novo deploy no Vercel, garantindo que o cache seja limpo (conforme instruções acima).

// #### 5. Verificar Outros Possíveis Problemas
// - **Caracteres Invisíveis**: Certifique-se de que o arquivo `page.tsx` não contém caracteres invisíveis (como espaços Unicode ou quebras de linha incorretas). Copie o código fornecido acima diretamente para o arquivo para evitar isso.
// - **Dependências**: Confirme que as dependências estão atualizadas:
  ```bash
  npm install next@latest typescript@latest @types/node@latest
  ```
// - **Formatação**: Execute `npm run lint` ou `npm run format` (se você usa ferramentas como ESLint ou Prettier) para garantir que o código está formatado corretamente.

// ### Resumo das Ações
// - **Corrigido `page.tsx`**: A construção do `href` foi simplificada para evitar problemas com template literals.
// - **Corrigido `next.config.js`**: Confirmada a remoção de `experimental.esmExternals`.
// - **Cache do Vercel**: Instruções fornecidas para limpar o cache de build.
// - **Teste Local**: Recomendado testar o build localmente antes do deploy.
// - **Deploy**: Commit e redeploy com cache limpo.

// Se o erro persistir após essas alterações, compartilhe:
// 1. O log completo do Vercel.
// 2. O conteúdo exato do arquivo `package.json` para verificar versões de dependências.
// 3. Qualquer mensagem de erro adicional do build local (se ocorrer).

// Isso deve resolver o problema, mas estou pronto para ajudar com qualquer erro remanescente!