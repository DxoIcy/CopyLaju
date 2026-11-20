import { supabaseAdmin, getUserFromRequest, jsonError } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Kemas kini nama & telefon pengguna sendiri (halaman Akaun)
export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");

  let body;
  try { body = await req.json(); } catch (_) { return jsonError("Data tidak sah."); }

  const name = String(body.name || "").trim().slice(0, 60);
  const phone = String(body.phone || "").replace(/[^0-9+]/g, "").slice(0, 15);
  if (name.length < 2) return jsonError("Sila isi nama penuh.");
  if (phone && phone.length < 9) return jsonError("Nombor telefon tidak sah.");

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ full_name: name, phone: phone || null })
    .eq("id", user.id);
  if (error) {
    console.error(error);
    return jsonError("Tidak dapat simpan. Cuba lagi.", 500);
  }
  return Response.json({ ok: true, name, phone });
}
