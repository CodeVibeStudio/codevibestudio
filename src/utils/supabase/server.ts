// src/utils/supabase/server.ts
// NOTA: Este ficheiro é apenas para o lado do servidor.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // A função `get` agora é assíncrona para seguir as boas práticas.
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // A função `set` agora é assíncrona.
        async set(name: string, value: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value, ...options });
          } catch (error) {
            // O método `set` foi chamado a partir de um Server Component.
            // Isto pode ser ignorado se tiver um middleware a atualizar as sessões.
          }
        },
        // A função `remove` agora é assíncrona.
        async remove(name: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // O método `delete` foi chamado a partir de um Server Component.
            // Isto pode ser ignorado se tiver um middleware a atualizar as sessões.
          }
        },
      },
    }
  );
};
