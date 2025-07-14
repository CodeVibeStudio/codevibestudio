// src/utils/supabase/server.ts
// NOTA: Este ficheiro é apenas para o lado do servidor.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // O método `set` foi chamado a partir de um Server Component.
            // Isto pode ser ignorado se tiver um middleware a atualizar as sessões.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O método `delete` foi chamado a partir de um Server Component.
            // Isto pode ser ignorado se tiver um middleware a atualizar as sessões.
          }
        },
      },
    }
  )
}
