"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/supabase-browser";
import { parseLink } from "@/lib/linkParser";
import { MOODS, LANGS } from "@/lib/prompt";
import { useApp } from "@/components/AppShell";
import ResultView, { PLAT_NAME, PLAT_ICON } from "@/components/ResultView";
import { IconLink, IconBolt, IconSparkle, IconRefresh } from "@/components/Icons";

const LOADING = [
  "Sedang baca link produk…",
  "Sedang fikir hook paling padu…",
  "Menyusun ayat yang buat orang berhenti scroll…",
  "Hampir siap…",
];

export default function JanaPage() {
  const { me, reload, toast, copy } = useApp();

  // borang
  const [linkRaw, setLinkRaw] = useState("");
  const [linkStat, setLinkStat] = useState(null);
  const [mode, setMode] = useState("affiliate");
  const [produk, setProduk] = useState("");
  const [info, setInfo] = useState("");
  const [harga, setHarga] = useState("");
  const [sasaran, setSasaran] = useState("");
  const [plat, setPlat] = useState(["tiktok", "threads", "facebook"]);
  const [mood, setMood] = useState(MOODS[0].value);
  const [bahasa, setBahasa] = useState("bm");
  const [variasi, setVariasi] = useState(2);

  // hasil
  const [busy, setBusy] = useState(false);
  const [loadMsg, setLoadMsg] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const produkRef = useRef(null);
  const outRef = useRef(null);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setLoadMsg((i) => (i + 1) % LOADING.length), 2200);
    return () => clearInterval(t);
  }, [busy]);

  // ---- Link affiliate ----
  // how: "type" = sedang menaip (semak tempatan sahaja)
  //      "blur" = keluar dari kotak (baca link pendek di server, tanpa jana)
  //      "paste" = tampal (baca link & terus jana)
  async function handleLink(raw, how) {
    setLinkRaw(raw);
    const v = raw.trim();
    if (!v) { setLinkStat(null); return; }
    const p = parseLink(v);
    if (!p.url && !p.name) { setLinkStat({ ok: false, t: "⚠️ Tiada link dikesan. Pastikan anda tampal link penuh." }); return; }
    if (p.price && !harga) setHarga(p.price);
    if (p.name) {
      setProduk(p.name);
      setLinkStat({ ok: true, t: `✅ ${p.platform ? p.platform + ": " : ""}${p.name}${p.price ? " · " + p.price : ""}` });
      if (how === "paste") generate({ produk: p.name, harga: harga || p.price, linkRaw: v });
      return;
    }
    if (how === "type") {
      setLinkStat({ ok: true, t: `🔗 Link ${p.platform} dikesan. Tekan Jana untuk teruskan.` });
      return;
    }
    setLinkStat({ ok: true, t: "🔎 Sedang baca link…" });
    try {
      const r = await apiFetch("/api/resolve-link", { raw: v });
      if (r.name) {
        setProduk(r.name);
        if (r.price && !harga) setHarga(r.price);
        setLinkStat({ ok: true, t: `✅ ${r.platform ? r.platform + ": " : ""}${r.name}` });
        if (how === "paste") generate({ produk: r.name, linkRaw: v });
        return;
      }
    } catch (_) {}
    setLinkStat({ ok: false, t: `🔗 Link ${p.platform} disimpan. Nama produk tak dapat dibaca — taip nama produk di bawah sekali sahaja.` });
    produkRef.current?.focus();
  }

  // ---- Jana ----
  async function generate(over = {}) {
    if (busy) return;
    const payload = {
      linkRaw: over.linkRaw ?? linkRaw, mode, produk: over.produk ?? produk, info,
      harga: over.harga ?? harga, sasaran, plat, mood, bahasa, variasi,
    };
    if (!payload.produk.trim() && !payload.linkRaw.trim()) { toast("Tampal link atau isi nama produk dulu 🙏"); produkRef.current?.focus(); return; }
    if (!plat.length) { toast("Pilih sekurang-kurangnya 1 platform"); return; }
    setBusy(true); setError(null); setLoadMsg(0);
    if (window.innerWidth < 1100) outRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const r = await apiFetch("/api/generate", payload);
      setResult(r);
      reload();
    } catch (e) {
      if (e.code === "no_credit") setError({ t: e.message, buy: true });
      else if (e.code === "need_name") { setError({ t: e.message }); produkRef.current?.focus(); }
      else setError({ t: e.message || "Ralat. Cuba lagi." });
    }
    setBusy(false);
  }

  function onSubmit(e) { e.preventDefault(); generate(); }
  function togglePlat(p) { setPlat((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p])); }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Jana Caption Affiliate</h1>
          <p>Tampal link produk Shopee, pilih gaya penulisan dan dapatkan caption menarik dalam 10 saat.</p>
        </div>
        {me && <span className="pill-tag">Baki: {me.totalLeft} kredit · 1 jana = 1 kredit</span>}
      </div>

      <div className="gen">
        <form className="card gen-form" onSubmit={onSubmit} autoComplete="off">
          <div className="field">
            <label htmlFor="link">Link produk Shopee / TikTok Shop</label>
            <div className="input-link">
              <IconLink />
              <textarea
                id="link"
                placeholder="Tampal link atau teks Share dari app Shopee di sini…"
                value={linkRaw}
                onChange={(e) => handleLink(e.target.value, "type")}
                onPaste={(e) => { const t = e.clipboardData.getData("text"); e.preventDefault(); handleLink(t, "paste"); }}
                onBlur={(e) => { if (e.target.value.trim() && !produk.trim() && !busy) handleLink(e.target.value, "blur"); }}
              />
            </div>
            {linkStat && <div className={"lstat " + (linkStat.ok ? "ok" : "warn")}>{linkStat.t}</div>}
            <p className="hint">Tip: Dalam app Shopee tekan <b>Share → Copy Link</b> dan tampal di sini. Caption terus dijana.</p>
          </div>

          <div className="field">
            <span className="label">Jenis kandungan</span>
            <div className="seg">
              {[["affiliate", "🛒 Affiliate"], ["bisnes", "🏪 Bisnes"], ["organik", "💬 Organik"]].map(([v, l]) => (
                <label className="chip" key={v}><input type="radio" name="mode" checked={mode === v} onChange={() => setMode(v)} /><span>{l}</span></label>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="produk">{mode === "bisnes" ? "Nama bisnes / produk / servis" : mode === "organik" ? "Topik / idea kandungan" : "Nama produk"}</label>
            <input id="produk" ref={produkRef} type="text" value={produk} onChange={(e) => setProduk(e.target.value)} placeholder="Diisi automatik dari link, atau taip sendiri" />
          </div>
          <div className="field">
            <label htmlFor="info">Kelebihan / info penting <small>(pilihan)</small></label>
            <textarea id="info" value={info} onChange={(e) => setInfo(e.target.value)} placeholder="cth: cerahkan kulit dalam 7 hari, sesuai kulit sensitif, KKM lulus" />
          </div>
          <div className="row2 field">
            <div><label className="label" htmlFor="harga">Harga <small>(pilihan)</small></label><input id="harga" type="text" value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="RM29.90" /></div>
            <div><label className="label" htmlFor="sasaran">Sasaran <small>(pilihan)</small></label><input id="sasaran" type="text" value={sasaran} onChange={(e) => setSasaran(e.target.value)} placeholder="cth: ibu muda" /></div>
          </div>

          <div className="field">
            <span className="label">Platform</span>
            <div className="chips">
              {["tiktok", "threads", "facebook"].map((p) => (
                <label className="chip" key={p}><input type="checkbox" checked={plat.includes(p)} onChange={() => togglePlat(p)} /><span>{PLAT_ICON[p]} {PLAT_NAME[p]}</span></label>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label">Pilih gaya penulisan</span>
            <div className="chips">
              {MOODS.map((m) => (
                <label className="chip" key={m.value}><input type="radio" name="mood" checked={mood === m.value} onChange={() => setMood(m.value)} /><span>{m.label}</span></label>
              ))}
            </div>
          </div>

          <div className="row2 field">
            <div>
              <label className="label" htmlFor="bahasa">Bahasa</label>
              <select id="bahasa" value={bahasa} onChange={(e) => setBahasa(e.target.value)}>
                {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="variasi">Variasi</label>
              <select id="variasi" value={variasi} onChange={(e) => setVariasi(+e.target.value)}>
                <option value={1}>1 setiap platform</option>
                <option value={2}>2 setiap platform</option>
                <option value={3}>3 setiap platform</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-block italic" disabled={busy}>
            <IconBolt /> {busy ? "Sedang menjana…" : "Jana Caption AI"}
          </button>
          <p className="hint" style={{ textAlign: "center" }}>Semak fakta produk sebelum post.</p>
        </form>

        <section ref={outRef} aria-live="polite">
          {error && (
            <div className="err">
              {error.t} {error.buy && <Link href="/app/kredit">Lihat pakej kredit →</Link>}
            </div>
          )}

          {busy ? (
            <div className="out-empty">
              <div className="loading"><div className="dots"><i /><i /><i /></div><p style={{ color: "#fff", fontWeight: 600 }}>{LOADING[loadMsg]}</p></div>
            </div>
          ) : result ? (
            <>
              <ResultView data={result.data} input={result.input} copy={copy} />
              <div className="regen">
                <button className="btn btn-ghost btn-sm" onClick={() => generate()}><IconRefresh /> Jana semula</button>
              </div>
            </>
          ) : (
            <div className="out-empty">
              <div>
                <div className="ic"><IconSparkle /></div>
                <h3>Hasil caption akan muncul di sini</h3>
                <p>Tampal link Shopee di sebelah untuk mula.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
