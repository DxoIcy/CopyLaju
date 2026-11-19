import { createClient } from "@supabase/supabase-js";

let client = null;

// Klien Supabase untuk pelayar (guna anon key — selamat untuk didedahkan)
export function supabaseBrowser() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}

// Panggil API server dengan token log masuk pengguna
export async function apiFetch(path, body) {
  const { data } = await supabaseBrowser().auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = {};
  try { json = await res.json(); } catch (_) {}
  if (!res.ok) {
    const err = new Error(json.error || "Ralat pelayan");
    err.code = json.code;
    err.status = res.status;
    throw err;
  }
  return json;
}
