// Kesan link + nama produk + harga daripada teks yang ditampal pengguna.
// Digunakan di pelayar (pratonton segera) dan di server.

function clean(s) {
  return s.replace(/\s+/g, " ").trim();
}

export function detectPlatform(url) {
  if (/shopee|shp\.ee/i.test(url)) return "Shopee";
  if (/tiktok/i.test(url)) return "TikTok Shop";
  if (/lazada/i.test(url)) return "Lazada";
  return "";
}

// Nama daripada URL penuh, cth: shopee.com.my/Serum-Vitamin-C-i.123.456
export function nameFromUrl(url) {
  try {
    const u = new URL(url);
    const seg = decodeURIComponent(u.pathname.split("/").filter(Boolean)[0] || "");
    const sm = seg.match(/^(.+?)-i\.\d+\.\d+$/);
    if (sm) return clean(sm[1].replace(/-/g, " "));
    if (/lazada/i.test(u.hostname)) {
      const lm = u.pathname.match(/\/products\/(.+?)-i\d+/);
      if (lm) return clean(lm[1].replace(/-/g, " "));
    }
  } catch (_) {}
  return "";
}

export function parseLink(raw) {
  const res = { url: "", name: "", price: "", platform: "" };
  if (!raw) return res;
  const m = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (m) res.url = m[0].replace(/[).,!]+$/, "");
  res.platform = detectPlatform(res.url);

  const pm = raw.match(/RM\s?\d[\d,]*(?:\.\d{1,2})?/i);
  if (pm) res.price = pm[0].replace(/\s/g, "").toUpperCase();

  if (res.url) res.name = nameFromUrl(res.url);

  // Nama daripada teks Share app (cth "Lihat X dengan harga RM.. Dapatkannya di Shopee sekarang! link")
  if (!res.name) {
    let t = raw
      .replace(/https?:\/\/\S+/g, "")
      .replace(/(dapatkan(nya)?|beli|get it|buy it|grab it)[^.!\n]*(shopee|tiktok|lazada|sekarang|now)[^.!\n]*[.!]?/gi, "")
      .replace(/(dengan harga|harga|for|at only|hanya)\s*RM\s?\d[\d,]*(\.\d{1,2})?/gi, "")
      .replace(/RM\s?\d[\d,]*(\.\d{1,2})?/gi, "")
      .replace(/^\s*(lihat|check out|tengok|jom tengok|cuba tengok)\s*/i, "")
      .replace(/\s+(di|on|at|kat)\s+(shopee|tiktok shop|lazada)\b.*$/i, "")
      .replace(/!+/g, "");
    t = clean(t).replace(/[.,:;\-–]+$/, "").trim();
    if (t.length >= 4) res.name = t.slice(0, 160);
  }
  return res;
}
