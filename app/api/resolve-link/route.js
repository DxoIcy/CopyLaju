import { getUserFromRequest, jsonError } from "@/lib/supabase-admin";
import { resolveLink } from "@/lib/resolveLink";

export const runtime = "nodejs";

// Pratonton: dapatkan nama produk daripada link pendek sebelum jana
export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");
  let body;
  try { body = await req.json(); } catch (_) { return jsonError("Data tidak sah."); }
  const raw = String(body.raw || "").slice(0, 1000);
  const info = await resolveLink(raw);
  return Response.json({ url: info.url, name: info.name, price: info.price, platform: info.platform });
}
