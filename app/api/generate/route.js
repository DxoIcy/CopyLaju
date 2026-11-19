import { supabaseAdmin, getUserFromRequest, jsonError } from "@/lib/supabase-admin";
import { sanitizeInput, buildPrompt, ensureLink } from "@/lib/prompt";
import { resolveLink } from "@/lib/resolveLink";
import { generateCopy } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");

  let body;
  try { body = await req.json(); } catch (_) { return jsonError("Data tidak sah."); }
  const d = sanitizeInput(body);

  // Baca link affiliate (termasuk link pendek) di server
  let link = "", linkPlat = "";
  if (d.linkRaw) {
    const info = await resolveLink(d.linkRaw);
    link = info.url || "";
    linkPlat = info.platform || "";
    if (!d.produk && info.name) d.produk = info.name;
    if (!d.harga && info.price) d.harga = info.price;
  }
  if (!d.produk) {
    return jsonError("Nama produk tidak dapat dikesan daripada link ini. Sila taip nama produk.", 400, "need_name");
  }

  const db = supabaseAdmin();

  // Tolak 1 kredit dahulu (atomik)
  const { data: source, error: cErr } = await db.rpc("consume_credit", { p_user: user.id });
  if (cErr) {
    console.error(cErr);
    return jsonError("Ralat pelayan. Cuba lagi.", 500);
  }
  if (source === "none") {
    return jsonError("Kuota anda sudah habis. Langgan atau tambah pakej untuk teruskan.", 402, "no_credit");
  }

  try {
    const input = { ...d, link, linkPlat };
    let data = await generateCopy(buildPrompt(input), d.variasi);
    data = ensureLink(data, link);

    await db.from("generations").insert({ user_id: user.id, input, output: data });
    return Response.json({ data, input });
  } catch (e) {
    console.error("Jana gagal", e);
    await db.rpc("refund_credit", { p_user: user.id, p_source: source });
    return jsonError("AI sibuk sebentar. Kredit anda tidak ditolak — sila cuba lagi.", 502, "ai_error");
  }
}
