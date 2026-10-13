import "server-only";
import { createClient } from "@supabase/supabase-js";

// Session-less client using the public anon key. Safe inside `use cache` scopes
// because it never reads cookies; RLS limits it to what any visitor may see or do.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
