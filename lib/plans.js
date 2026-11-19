// =====================================================================
// PAKEJ LANGGANAN — ubah harga, tempoh & kuota di sini sahaja.
// price_sen: harga dalam sen (3990 = RM39.90)
// days: tempoh pakej (hari)
// quota: had jana setiap 30 hari selagi pakej aktif
// =====================================================================
export const PLANS = [
  {
    id: "1bulan",
    name: "Pro 1 Bulan",
    price_sen: 3990,
    days: 30,
    quota: 500,
    badge: "Paling Popular",
    features: ["500 jana sebulan", "TikTok, Threads & Facebook", "Auto baca link Shopee", "7 gaya penulisan", "Semua bahasa"],
  },
  {
    id: "3bulan",
    name: "Pro 3 Bulan",
    price_sen: 4990,
    days: 90,
    quota: 600,
    badge: "Paling Jimat",
    features: ["600 jana sebulan", "Kuota diisi semula setiap 30 hari", "TikTok, Threads & Facebook", "Auto baca link Shopee", "Semua bahasa"],
  },
  {
    id: "1tahun",
    name: "Pro 1 Tahun",
    price_sen: 14990,
    days: 365,
    quota: 750,
    badge: null,
    features: ["750 jana sebulan", "Kuota diisi semula setiap 30 hari", "TikTok, Threads & Facebook", "Auto baca link Shopee", "Sokongan keutamaan"],
  },
];

// Kredit percuma untuk pengguna baru ditetapkan dalam supabase/schema.sql
// (lajur free_credits default 1).

export function getPlan(id) {
  return PLANS.find((p) => p.id === id) || null;
}

export function formatRM(sen) {
  return "RM" + (sen / 100).toFixed(2);
}
