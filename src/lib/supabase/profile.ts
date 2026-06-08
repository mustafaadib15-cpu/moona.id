import { createClient } from "./server";

export type Role = "client" | "admin";

export interface CurrentProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  client_id: string | null;
}

// Resolve the signed-in user's profile (role + client account). Returns null
// when there is no authenticated user. Uses getUser() (validated server-side).
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, client_id")
    .eq("id", user.id)
    .single();

  return (data as CurrentProfile | null) ?? null;
}
