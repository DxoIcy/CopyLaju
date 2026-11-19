import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAndActivate } from "@/lib/orders";

export const runtime = "nodejs";

// ToyyibPay POST ke sini selepas pelanggan bayar.
// Kita TIDAK percaya data callback bulat-bulat: status disemak semula
// terus dengan ToyyibPay (getBillTransactions) sebelum pakej diaktifkan.
export async function POST(req) {
  let fields = {};
  try {
    const form = await req.formData();
    fields = Object.fromEntries(form.entries());
  } catch (_) {
    try { fields = await req.json(); } catch (_) {}
  }

  const billcode = String(fields.billcode || "");
  const ref = String(fields.order_id || "");
  if (!billcode && !ref) return new Response("missing", { status: 400 });

  const db = supabaseAdmin();
  let q = db.from("orders").select("*");
  q = billcode ? q.eq("bill_code", billcode) : q.eq("ref", ref);
  const { data: order } = await q.maybeSingle();
  if (!order) return new Response("not found", { status: 404 });

  const status = await verifyAndActivate(order);
  if (status !== "paid" && String(fields.status) === "3" && order.status === "pending") {
    await db.from("orders").update({ status: "failed" }).eq("id", order.id);
  }
  return new Response("OK");
}
