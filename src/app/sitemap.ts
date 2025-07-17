// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://codevibestudio.vercel.app"; // URL final do seu site

  // 1. Adiciona as páginas estáticas do seu site
  const staticRoutes = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${siteUrl}/#projetos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/#sobre`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/#contato`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // 2. Busca os produtos para criar as rotas dinâmicas
  // Certifique-se de que a sua tabela 'products' tem uma coluna 'updated_at'
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at");

  const productRoutes = products
    ? products.map((product) => ({
        url: `${siteUrl}/produtos/${product.slug}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }))
    : [];

  // 3. Combina todas as rotas
  return [...staticRoutes, ...productRoutes];
}
