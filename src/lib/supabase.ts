import { createClient } from "@supabase/supabase-js";

// Lê as variáveis de ambiente para conectar com o Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria e exporta uma instância única do cliente Supabase
// Isso pode ser usado tanto no lado do cliente quanto no servidor.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para operações que exigem privilégios de administrador (como no webhook),
// criaremos um cliente separado usando a chave de serviço.
// É crucial que este NUNCA seja exposto no lado do cliente.
export const getSupabaseAdmin = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
