```typescript
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
          {(plans || []).map((plan: Plan) => (
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
                href={`/signup?planId=${plan.stripe_price_id || plan.id}`}
                className="mt-8 block w-full text-center font-bold py-3 px-6 rounded-lg bg-primaria text-white hover:bg-blue-800 transition-colors"
              >
                Contratar Plano
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductPlansPage;
```

#### Mudanças no `page.tsx`:
- **Tipagem Corrigida**: Usamos `NextPage<ProductPlansPageProps>` para tipar a página, onde `ProductPlansPageProps` define `params` como `{ slug: string }`. Isso alinha com o comportamento esperado do Next.js para rotas dinâmicas.
- **Interfaces Adicionadas**: Definimos `Plan` e `Product` para tipar os dados retornados do Supabase, eliminando o uso de `any`.
- **Exportação Nomeada**: Explicitamos a função como `const ProductPlansPage: NextPage<...>` e usamos `export default` para manter a compatibilidade com o Next.js.

#### 2. Atualizar `next.config.js`
O aviso sobre `experimental.esmExternals` persiste porque a configuração ainda está presente, mesmo definida como `false`. Como `false` é o valor padrão, podemos remover completamente a seção `experimental`. Aqui está o `next.config.js` atualizado:

<xaiArtifact artifact_id="01cb0b1e-cb52-44b9-a076-4209156a600c" artifact_version_id="f35d1d32-f39a-4fbe-9a9c-a38a6d05cab2" title="next.config.js" contentType="text/javascript">
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removida a seção experimental para evitar o aviso
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

#### Mudanças no `next.config.js`:
- **Remoção de `experimental`**: A seção `experimental` foi completamente removida, pois `esmExternals: false` é o padrão e não precisa ser especificado.
- O restante da configuração foi mantido intacto.

#### 3. Verificar `tsconfig.json`
O `tsconfig.json` fornecido parece adequado para o Next.js 15.3.5, mas vamos garantir que ele esteja otimizado. Ele já inclui as configurações recomendadas, como `"moduleResolution": "bundler"`, `"jsx": "preserve"`, e o plugin do Next.js. Não são necessárias alterações, mas certifique-se de que as dependências do TypeScript e do Next.js estão atualizadas:

```bash
npm install next@latest typescript@latest @types/node@latest
```

#### 4. Testar o Build
Após aplicar as correções:
1. **Atualize os arquivos**:
   - Substitua o conteúdo de `src/app/produtos/[slug]/page.tsx` pelo código fornecido acima.
   - Substitua o conteúdo de `next.config.js` pelo código fornecido acima.
2. **Teste localmente**:
   - Execute `npm run build` no seu ambiente local para verificar se o build é concluído sem erros.
3. **Faça o commit e deploy**:
   - Commit as alterações no repositório:
     ```bash
     git add src/app/produtos/[slug]/page.tsx next.config.js
     git commit -m "Corrige erro de tipagem no page.tsx e remove experimental.esmExternals"
     git push
     ```
   - Redeploy no Vercel.

#### 5. Observação sobre o `route.ts`
O arquivo `route.ts` já foi corrigido anteriormente com a verificação do `headersInstance.get`. Certifique-se de que ele está conforme o código fornecido na sua pergunta anterior. Se o erro de tipagem no `page.tsx` for resolvido, o `route.ts` não deve causar problemas adicionais, já que o erro atual está relacionado apenas ao `page.tsx`.

### Resumo das Ações
- **Corrigido `page.tsx`**: Ajustada a tipagem com `NextPage` e interfaces específicas para `params` e dados do Supabase.
- **Atualizado `next.config.js`**: Removida a seção `experimental` para eliminar o aviso sobre `esmExternals`.
- **Verificado `tsconfig.json`**: Confirmado que está correto, com recomendação para atualizar dependências.
- **Próximos passos**: Testar o build localmente e redeploy no Vercel.

Se o erro persistir após essas alterações, compartilhe os novos logs do Vercel ou qualquer mensagem de erro adicional. Caso precise de ajuda com outros arquivos ou configurações, é só informar!