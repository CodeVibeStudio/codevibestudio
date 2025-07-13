import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente Supabase para uso geral (seguro para o lado do cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// CORREÇÃO: Esta função cria e retorna o cliente de administração.
// Ela precisa de ser exportada para que as nossas APIs a possam usar.
export const getSupabaseAdmin = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "A chave de serviço do Supabase (SUPABASE_SERVICE_ROLE_KEY) não está definida."
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
