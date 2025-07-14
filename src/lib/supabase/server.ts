// src/lib/supabase/server.ts
// Este ficheiro cria um cliente Supabase para ser usado em Componentes de Servidor,
// Route Handlers (APIs) e Server Actions.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ação `set` pode falhar em Server Components ou Route Handlers
            // que tentam definir um cookie. Isso não é um problema.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Ação `delete` pode falhar em Server Components ou Route Handlers
            // que tentam definir um cookie. Isso não é um problema.
          }
        },
      },
    }
  );
}
