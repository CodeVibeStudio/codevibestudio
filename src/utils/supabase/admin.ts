// src/utils/supabase/admin.ts
// ESTE CLIENTE É APENAS PARA USO NO BACKEND SEGURO (EX: WEBHOOKS)

import { createClient } from '@supabase/supabase-js'

// Validação para garantir que as variáveis de ambiente estão definidas.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Cria e exporta um cliente Supabase com privilégios de administrador.
// Este cliente usa a chave de serviço e pode ignorar as políticas de RLS.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      // Desativa a persistência de sessão para uso no backend.
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
