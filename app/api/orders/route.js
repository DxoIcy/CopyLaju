import { supabaseAdmin, getUserFromRequest, jsonError } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Senarai pembelian pengguna sendiri (halaman Kredit)
export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("ref, plan, amount_sen, status, created_at, paid_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error(error);
    return jsonError("Tidak dapat memuatkan pembelian.", 500);
  }
  return Response.json({ orders: data || [] });
}
