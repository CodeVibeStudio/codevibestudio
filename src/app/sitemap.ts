// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://codevibestudio.vercel.app";

  // 1. Adiciona APENAS as páginas estáticas reais
  const staticRoutes = [
    {
      url: `${siteUrl}/`, // Apenas a página inicial
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    // Remova as outras rotas com '#' daqui
  ];

  // 2. Busca os produtos para criar as rotas dinâmicas (código permanece o mesmo)
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
