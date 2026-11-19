import { supabaseAdmin, getUserFromRequest, jsonError } from "@/lib/supabase-admin";
import { verifyAndActivate } from "@/lib/orders";

export const runtime = "nodejs";

// Dipanggil oleh halaman /bayaran/selesai — semak & aktifkan jika callback terlepas
export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");
  let body;
  try { body = await req.json(); } catch (_) { return jsonError("Data tidak sah."); }

  const billcode = String(body.billcode || "");
  if (!billcode) return jsonError("Kod bil tiada.");

  const db = supabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("*")
    .eq("bill_code", billcode)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) return jsonError("Pesanan tidak dijumpai.", 404);

  const status = await verifyAndActivate(order);
  return Response.json({ status, plan: order.plan });
}
