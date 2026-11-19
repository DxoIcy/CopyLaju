// SERVER SAHAJA: buka link pendek (s.shopee.com.my, vt.tiktok.com, dll)
// untuk dapatkan URL penuh dan nama produk.
import { parseLink, nameFromUrl, detectPlatform } from "./linkParser";

// Hanya domain kedai online ini dibenarkan (elak server dipaksa buka laman lain)
const ALLOWED = [
  /(^|\.)shopee\.com\.my$/i, /(^|\.)shopee\.sg$/i, /(^|\.)shopee\.co\.id$/i, /(^|\.)shopee\.ph$/i,
  /(^|\.)shopee\.co\.th$/i, /(^|\.)shopee\.vn$/i, /(^|\.)shp\.ee$/i,
  /(^|\.)tiktok\.com$/i,
  /(^|\.)lazada\.com\.my$/i, /(^|\.)lazada\.sg$/i, /(^|\.)lazada\.co\.id$/i,
];

function allowed(url) {
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") && ALLOWED.some((r) => r.test(u.hostname));
  } catch (_) {
    return false;
  }
}

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const GENERIC_TITLES = /^(shopee|tiktok|lazada|login|log in|security|verify|access denied|just a moment)/i;

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function titleFromHtml(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  let t = og ? og[1] : (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1];
  if (!t) return "";
  t = decodeEntities(t).replace(/\s*[|\-–]\s*(Shopee|TikTok|Lazada).*$/i, "").trim();
  if (t.length < 4 || GENERIC_TITLES.test(t)) return "";
  return t.slice(0, 160);
}

// Ikut redirect secara manual (maks 6) supaya setiap hop disemak
async function followRedirects(start) {
  let url = start;
  for (let i = 0; i < 6; i++) {
    if (!allowed(url)) return { finalUrl: url, html: "" };
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": UA, "Accept-Language": "ms-MY,ms;q=0.9,en;q=0.8" },
      signal: AbortSignal.timeout(6000),
    });
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      url = new URL(loc, url).toString();
      continue;
    }
    let html = "";
    const type = res.headers.get("content-type") || "";
    if (res.ok && type.includes("text/html")) {
      html = (await res.text()).slice(0, 300000);
    }
    return { finalUrl: url, html };
  }
  return { finalUrl: url, html: "" };
}

export async function resolveLink(raw) {
  const info = parseLink(raw);
  if (!info.url || info.name) return info;
  if (!allowed(info.url)) return info;

  try {
    const { finalUrl, html } = await followRedirects(info.url);
    info.resolvedUrl = finalUrl;
    info.platform = info.platform || detectPlatform(finalUrl);
    info.name = nameFromUrl(finalUrl) || (html ? titleFromHtml(html) : "");
  } catch (_) {
    // Gagal buka link — pengguna akan diminta taip nama produk
  }
  return info;
}
