// src/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Atualiza a sessão do utilizador. Essencial para manter o utilizador logado.
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto os que começam com:
     * - _next/static (ficheiros estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico (ficheiro de ícone)
     * Fique à vontade para modificar este matcher para se adequar às suas necessidades.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
