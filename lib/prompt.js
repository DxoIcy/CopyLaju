// Bina arahan (prompt) untuk AI.

export const MOODS = [
  { value: "Cerita (storytelling)", label: "📖 Cerita" },
  { value: "Hook curiosity", label: "🤔 Curiosity" },
  { value: "FOMO & urgensi", label: "⏰ FOMO" },
  { value: "Testimoni / review jujur", label: "⭐ Review Jujur" },
  { value: "Masalah lalu penyelesaian", label: "💡 Masalah → Solusi" },
  { value: "Kelakar & santai", label: "😂 Kelakar" },
  { value: "Hot take / kontroversi ringan", label: "🌶️ Hot Take" },
];

export const LANGS = [
  { value: "bm", label: "BM Santai", prompt: "Bahasa Melayu santai (gaya Malaysia, boleh campur sikit perkataan Inggeris yang biasa digunakan)" },
  { value: "bmf", label: "BM Formal", prompt: "Bahasa Melayu baku dan sopan" },
  { value: "rojak", label: "Rojak", prompt: "Bahasa rojak Malaysia (campur Melayu-Inggeris)" },
  { value: "en", label: "English", prompt: "English (Malaysian casual tone)" },
  { value: "id", label: "Indonesia", prompt: "Bahasa Indonesia santai" },
];

export const SYSTEM_PROMPT =
  "Anda pakar copywriter media sosial Malaysia yang menulis kandungan viral untuk affiliate dan peniaga kecil. " +
  "Anda sentiasa membalas dengan JSON sah sahaja, tanpa teks lain dan tanpa ```.";

export function buildPrompt(d) {
  const lang = LANGS.find((l) => l.value === d.bahasa) || LANGS[0];
  const modeDesc = {
    affiliate: "promosi produk affiliate (TikTok Shop / Shopee Affiliate). CTA arahkan ke 'beg kuning', 'link di bio', atau 'klik link' mengikut platform.",
    bisnes: "promosi bisnes/produk/servis milik sendiri. CTA arahkan untuk DM, WhatsApp, datang ke kedai atau tempah.",
    organik: "kandungan organik untuk naikkan engagement dan followers (bukan jualan keras). CTA ajak komen, share, follow.",
  }[d.mode] || "";

  const want = {
    tiktok: `"tiktok": array ${d.variasi} objek {"hook": "ayat pembuka 3 saat pertama, sangat menangkap", "skrip": "skrip voiceover/bercakap 30-45 saat, ayat pendek, setiap ayat baris baru, boleh letak arahan visual dalam [kurungan]", "caption": "caption TikTok pendek dengan emoji", "hashtag": "5-7 hashtag relevan dipisah ruang"}`,
    threads: `"threads": array ${d.variasi} objek {"posts": [3 string] — thread 3 bahagian: (1) hook yang buat orang nak baca lagi, (2) cerita/nilai/bukti, (3) penutup + CTA. Setiap post bawah 450 aksara, gaya bersembang, emoji secukupnya}`,
    facebook: `"facebook": array ${d.variasi} objek {"post": "post Facebook lengkap 120-220 patah perkataan: hook baris pertama, perenggan pendek, bullet emoji untuk kelebihan, CTA jelas, 3-5 hashtag di hujung"}`,
  };

  const linkLine = d.link
    ? `- Link affiliate (${d.linkPlat || "kedai online"}): ${d.link}
  -> Facebook: letak link ini TEPAT seperti diberi dalam CTA (baris sendiri, cth "👉 Beli di sini: <link>").
  -> Threads: letak link ini TEPAT seperti diberi dalam bahagian 3.
  -> TikTok: JANGAN letak link (TikTok tak boleh klik); suruh tekan beg kuning / link di bio.`
    : "";

  return `TUGAS: Tulis copywriting untuk ${modeDesc}

MAKLUMAT:
- ${d.mode === "organik" ? "Topik" : "Produk/bisnes"}: ${d.produk}
- Kelebihan/info: ${d.info || "(tiada — guna pengetahuan umum yang munasabah, JANGAN reka statistik, jumlah jualan, atau tuntutan kesihatan/perubatan)"}
- Harga: ${d.harga || "(tidak dinyatakan — jangan sebut harga spesifik)"}
- Sasaran pembaca: ${d.sasaran || "umum Malaysia"}
- Gaya/mood: ${d.mood}
- Bahasa: ${lang.prompt}
${linkLine}

PERATURAN:
- Bunyi macam manusia sebenar, bukan iklan robotik. Elak klise berlebihan.
- Jangan reka fakta, testimoni palsu bernama, atau tuntutan "dijamin"/"100% berkesan"/menyembuhkan penyakit.
- Setiap variasi mesti berbeza sudut dan hook.
- Ikut format platform masing-masing.

Pulangkan HANYA JSON sah dengan kunci berikut sahaja:
{
${d.plat.map((p) => "  " + want[p]).join(",\n")}
}`;
}

// Bersihkan & sahkan input daripada pelayar
export function sanitizeInput(body) {
  const s = (v, n) => String(v ?? "").trim().slice(0, n);
  const plat = Array.isArray(body.plat) ? body.plat.filter((p) => ["tiktok", "threads", "facebook"].includes(p)) : [];
  const variasi = Math.min(3, Math.max(1, parseInt(body.variasi, 10) || 2));
  return {
    linkRaw: s(body.linkRaw, 1000),
    mode: ["affiliate", "bisnes", "organik"].includes(body.mode) ? body.mode : "affiliate",
    produk: s(body.produk, 200),
    info: s(body.info, 1500),
    harga: s(body.harga, 40),
    sasaran: s(body.sasaran, 100),
    plat: plat.length ? plat : ["tiktok", "threads", "facebook"],
    mood: MOODS.some((m) => m.value === body.mood) ? body.mood : MOODS[0].value,
    bahasa: LANGS.some((l) => l.value === body.bahasa) ? body.bahasa : "bm",
    variasi,
  };
}

// Pastikan link affiliate ada dalam post Facebook & Threads
export function ensureLink(data, link) {
  if (!link) return data;
  (data.facebook || []).forEach((f) => {
    if (f.post && !f.post.includes(link)) f.post += `\n\n👉 Beli di sini: ${link}`;
  });
  (data.threads || []).forEach((t) => {
    const ps = t.posts || [];
    if (ps.length && !ps.join(" ").includes(link)) ps[ps.length - 1] += `\n\n🔗 ${link}`;
  });
  return data;
}
