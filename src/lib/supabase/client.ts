// src/lib/supabase/client.ts

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Cria e exporta uma instância única do cliente Supabase para o lado do cliente (browser).
// Usar esta instância em todos os componentes de cliente garante que não haverá
// múltiplas instâncias e que a autenticação será consistente.
export const supabase = createClientComponentClient();
