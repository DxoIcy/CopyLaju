import { supabaseAdmin, getUserFromRequest, jsonError } from "@/lib/supabase-admin";
import { getPlan } from "@/lib/plans";
import { createBill } from "@/lib/toyyibpay";

export const runtime = "nodejs";

export async function POST(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");

  let body;
  try { body = await req.json(); } catch (_) { return jsonError("Data tidak sah."); }

  const plan = getPlan(body.plan);
  if (!plan) return jsonError("Pakej tidak sah.");

  const name = String(body.name || "").trim().slice(0, 60);
  const phone = String(body.phone || "").replace(/[^0-9+]/g, "").slice(0, 15);
  if (name.length < 2) return jsonError("Sila isi nama penuh.");
  if (phone.length < 9) return jsonError("Sila isi nombor telefon yang sah.");

  const db = supabaseAdmin();
  await db.from("profiles").update({ full_name: name, phone }).eq("id", user.id);

  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const ref = "CL" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  const { data: order, error } = await db
    .from("orders")
    .insert({ ref, user_id: user.id, plan: plan.id, amount_sen: plan.price_sen })
    .select()
    .single();
  if (error) {
    console.error(error);
    return jsonError("Tidak dapat cipta pesanan. Cuba lagi.", 500);
  }

  try {
    const { billCode, paymentUrl } = await createBill({
      ref,
      plan,
      user,
      name,
      phone,
      returnUrl: `${site}/bayaran/selesai`,
      callbackUrl: `${site}/api/toyyibpay/callback`,
    });
    await db.from("orders").update({ bill_code: billCode }).eq("id", order.id);
    return Response.json({ paymentUrl });
  } catch (e) {
    console.error(e);
    await db.from("orders").update({ status: "failed" }).eq("id", order.id);
    return jsonError("Gagal sambung ke ToyyibPay. Cuba sebentar lagi.", 502);
  }
}
