import { supabaseAdmin, getUserFromRequest, jsonError } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Maklumat akaun, baki kuota & sejarah terkini
export async function GET(req) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonError("Sila log masuk dahulu.", 401, "auth");
  const db = supabaseAdmin();

  let { data: p } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!p) {
    // Jaga-jaga jika trigger belum wujud semasa pengguna daftar
    const ins = await db.from("profiles").upsert({ id: user.id, email: user.email }).select().single();
    p = ins.data;
  }

  const active = !!(p?.plan_expires_at && new Date(p.plan_expires_at) > new Date());
  let used = p?.used || 0;
  if (active && p.period_start && Date.now() >= new Date(p.period_start).getTime() + 30 * 864e5) used = 0;
  const planLeft = active ? Math.max(0, (p.monthly_quota || 0) - used) : 0;

  const { data: history } = await db
    .from("generations")
    .select("id, input, output, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(15);

  return Response.json({
    email: user.email,
    name: p?.full_name || "",
    phone: p?.phone || "",
    plan: active ? p.plan : null,
    planExpiresAt: active ? p.plan_expires_at : null,
    monthlyQuota: active ? p.monthly_quota : 0,
    planLeft,
    freeCredits: p?.free_credits || 0,
    totalLeft: planLeft + (p?.free_credits || 0),
    history: history || [],
  });
}
