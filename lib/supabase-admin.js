import { createClient } from "@supabase/supabase-js";

// Klien Supabase untuk SERVER sahaja (service role key — JANGAN dedahkan)
let admin = null;
export function supabaseAdmin() {
  if (!admin) {
    admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return admin;
}

// Dapatkan pengguna daripada header "Authorization: Bearer <token>"
export async function getUserFromRequest(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export function jsonError(message, status = 400, code) {
  return Response.json({ error: message, code }, { status });
}
