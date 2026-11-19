"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Pricing from "@/components/Pricing";
import { supabaseBrowser, apiFetch } from "@/lib/supabase-browser";
import { parseLink } from "@/lib/linkParser";
import { MOODS, LANGS } from "@/lib/prompt";
import { getPlan } from "@/lib/plans";

const NAME = { tiktok: "TikTok", threads: "Threads", facebook: "Facebook" };
const ICON = { tiktok: "🎵", threads: "🧵", facebook: "📘" };
const LOADING = ["Sedang baca link produk…", "Sedang fikir hook paling padu…", "Menyusun ayat yang buat orang berhenti scroll…", "Hampir siap…"];

export default function AppPage() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);

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
  const [tab, setTab] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");
  const produkRef = useRef(null);
  const outRef = useRef(null);

  const loadMe = useCallback(async () => {
    try {
      setMe(await apiFetch("/api/me"));
    } catch (e) {
      if (e.status === 401) window.location.href = "/masuk";
    }
  }, []);

  useEffect(() => {
    supabaseBrowser().auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/masuk";
      else { setReady(true); loadMe(); }
    });
  }, [loadMe]);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setLoadMsg((i) => (i + 1) % LOADING.length), 2200);
    return () => clearInterval(t);
  }, [busy]);

  function showToast(t) {
    setToast(t);
    setTimeout(() => setToast(""), 1600);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); showToast("Disalin! Tampal di app 📲"); }
    catch (_) { showToast("Tak dapat salin. Pilih teks & salin manual."); }
  }

  // ---- Link affiliate ----
  // mode: "type" = sedang menaip (semak tempatan sahaja)
  //       "blur" = keluar dari kotak (baca link pendek di server, tanpa jana)
  //       "paste" = tampal (baca link & terus jana)
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
    // Link pendek — minta server buka link
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
    if (!payload.produk.trim() && !payload.linkRaw.trim()) { showToast("Tampal link atau isi nama produk dulu 🙏"); produkRef.current?.focus(); return; }
    if (!plat.length) { showToast("Pilih sekurang-kurangnya 1 platform"); return; }
    setBusy(true); setError(null); setLoadMsg(0);
    if (window.innerWidth < 900) outRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const r = await apiFetch("/api/generate", payload);
      setResult(r);
      setTab((t) => (r.input.plat.includes(t) ? t : r.input.plat[0]));
      loadMe();
    } catch (e) {
      if (e.code === "no_credit") {
        setError({ t: e.message, buy: true });
      } else if (e.code === "need_name") {
        setError({ t: e.message });
        produkRef.current?.focus();
      } else setError({ t: e.message || "Ralat. Cuba lagi." });
    }
    setBusy(false);
  }

  function onSubmit(e) { e.preventDefault(); generate(); }
  function togglePlat(p) { setPlat((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p])); }

  if (!ready) return <><Nav /><div className="result-page"><div className="dots"><i /><i /><i /></div></div></>;

  const planInfo = me?.plan ? getPlan(me.plan) : null;
  const items = result?.data?.[tab] || [];
  const plats = result ? result.input.plat.filter((p) => Array.isArray(result.data[p]) && result.data[p].length) : [];

  return (
    <>
      <Nav />
      <section id="jana" style={{ marginTop: 20 }}>
        <div className="wrap">
          {me && (
            <div className="acct">
              <div>
                <small>{me.email}</small>
                <div>
                  <span className="q">{me.totalLeft}</span>{" "}
                  <small>
                    baki jana
                    {planInfo ? ` · ${planInfo.name} aktif hingga ${new Date(me.planExpiresAt).toLocaleDateString("ms-MY")}` : " · tiada pakej aktif"}
                  </small>
                </div>
              </div>
              <a className="btn btn-coral" href="#harga">{planInfo ? "Tambah Pakej" : "Langgan Pro"}</a>
            </div>
          )}

          <div className="gen">
            <form className="panel form-panel" onSubmit={onSubmit} autoComplete="off">
              <div className="field">
                <label>🔗 Tampal link affiliate Shopee / TikTok Shop</label>
                <textarea
                  style={{ minHeight: 64 }}
                  placeholder="Tampal link atau teks Share dari app Shopee di sini…"
                  value={linkRaw}
                  onChange={(e) => handleLink(e.target.value, "type")}
                  onPaste={(e) => { const t = e.clipboardData.getData("text"); e.preventDefault(); handleLink(t, "paste"); }}
                  onBlur={(e) => { if (e.target.value.trim() && !produk.trim() && !busy) handleLink(e.target.value, "blur"); }}
                />
                {linkStat && <div className={"lstat " + (linkStat.ok ? "ok" : "warn")}>{linkStat.t}</div>}
                <p className="hint" style={{ textAlign: "left", marginTop: 6 }}>Tip: Dalam app Shopee tekan <b>Share → Copy Link</b> dan tampal di sini. Copy terus dijana.</p>
              </div>

              <div className="field">
                <label>Jenis kandungan</label>
                <div className="tabs-mode">
                  {[["affiliate", "🛒 Affiliate"], ["bisnes", "🏪 Bisnes Sendiri"], ["organik", "💬 Organik"]].map(([v, l]) => (
                    <label className="chip" key={v}><input type="radio" name="mode" checked={mode === v} onChange={() => setMode(v)} /><span>{l}</span></label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>{mode === "bisnes" ? "Nama bisnes / produk / servis" : mode === "organik" ? "Topik / idea kandungan" : "Nama produk"}</label>
                <input ref={produkRef} type="text" value={produk} onChange={(e) => setProduk(e.target.value)} placeholder="Diisi automatik dari link, atau taip sendiri" />
              </div>
              <div className="field">
                <label>Kelebihan / info penting <small>(pilihan)</small></label>
                <textarea value={info} onChange={(e) => setInfo(e.target.value)} placeholder="cth: cerahkan kulit dalam 7 hari, sesuai kulit sensitif, KKM lulus" />
              </div>
              <div className="row2 field">
                <div><label>Harga <small>(pilihan)</small></label><input type="text" value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="RM29.90" /></div>
                <div><label>Sasaran <small>(pilihan)</small></label><input type="text" value={sasaran} onChange={(e) => setSasaran(e.target.value)} placeholder="cth: ibu muda" /></div>
              </div>

              <div className="field">
                <label>Platform</label>
                <div className="chips">
                  {["tiktok", "threads", "facebook"].map((p) => (
                    <label className="chip" key={p}><input type="checkbox" checked={plat.includes(p)} onChange={() => togglePlat(p)} /><span>{ICON[p]} {NAME[p]}</span></label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Gaya / mood</label>
                <div className="chips">
                  {MOODS.map((m) => (
                    <label className="chip" key={m.value}><input type="radio" name="mood" checked={mood === m.value} onChange={() => setMood(m.value)} /><span>{m.label}</span></label>
                  ))}
                </div>
              </div>

              <div className="row2 field">
                <div>
                  <label>Bahasa</label>
                  <select value={bahasa} onChange={(e) => setBahasa(e.target.value)}>
                    {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label>Variasi</label>
                  <select value={variasi} onChange={(e) => setVariasi(+e.target.value)}>
                    <option value={1}>1 setiap platform</option>
                    <option value={2}>2 setiap platform</option>
                    <option value={3}>3 setiap platform</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-coral" id="genBtn" disabled={busy}>{busy ? "⏳ Sedang menjana…" : "⚡ Jana Copy Sekarang"}</button>
              <p className="hint">1 jana = 1 kredit. Semak fakta produk sebelum post.</p>
            </form>

            <div ref={outRef}>
              {error && (
                <div className="err">
                  {error.t}{" "}
                  {error.buy && <a href="#harga" style={{ color: "var(--lime)", fontWeight: 700 }}>Lihat pakej →</a>}
                </div>
              )}

              {busy ? (
                <div className="out-empty"><div className="loading"><div className="dots"><i /><i /><i /></div><p style={{ color: "#fff", fontWeight: 600 }}>{LOADING[loadMsg]}</p></div></div>
              ) : result ? (
                <>
                  <div className="out-tabs">
                    {plats.map((p) => (
                      <button key={p} className={"out-tab" + (p === tab ? " on" : "")} onClick={() => setTab(p)}>
                        {ICON[p]} {NAME[p]} <span style={{ opacity: 0.6 }}>{result.data[p].length}</span>
                      </button>
                    ))}
                  </div>
                  {items.map((it, i) => <ResultCard key={tab + i} p={tab} it={it} i={i} copy={copy} />)}
                  <div className="regen"><button className="btn btn-ghost" onClick={() => generate()}>🔄 Jana semula</button></div>
                </>
              ) : (
                <div className="out-empty">
                  <div><div className="big">✍️</div><p style={{ fontWeight: 700, color: "#fff", fontSize: 18 }}>Copy anda akan muncul di sini</p><p style={{ marginTop: 6, fontSize: 14 }}>Tampal link affiliate di sebelah untuk mula.</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {me?.history?.length > 0 && (
        <section style={{ paddingBottom: 0 }}>
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div className="sec-head"><h2 style={{ fontSize: 32 }}>Copy terdahulu</h2></div>
            <div className="hist">
              {me.history.map((h) => (
                <div key={h.id} className="hist-item" onClick={() => {
                  const r = { data: h.output, input: h.input };
                  setResult(r); setError(null);
                  setTab(h.input.plat?.[0] || "tiktok");
                  document.getElementById("jana")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  <div>
                    <b>{h.input.produk}</b><br />
                    <small>{h.input.mood} · {(h.input.plat || []).map((p) => NAME[p]).join(", ")} · {new Date(h.created_at).toLocaleString("ms-MY", { dateStyle: "short", timeStyle: "short" })}</small>
                  </div>
                  <span>↗</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="harga">
        <div className="wrap">
          <div className="sec-head"><h2>Pakej Pro</h2><p>Bayaran sekali melalui FPX atau kad. Tiada auto-caj.</p></div>
          <Pricing profile={me} autoOpen />
        </div>
      </section>

      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </>
  );
}

function ResultCard({ p, it, i, copy }) {
  let full = "";
  let body = null;
  if (p === "tiktok") {
    full = `HOOK:\n${it.hook}\n\nSKRIP:\n${it.skrip}\n\nCAPTION:\n${it.caption}\n${it.hashtag}`;
    body = (
      <>
        <div className="blk"><h4>🪝 Hook (3 saat pertama)</h4><div className="hook">{it.hook}</div></div>
        <div className="blk"><h4>🎙️ Skrip video</h4><div className="txt">{it.skrip}</div></div>
        <div className="blk">
          <h4>💬 Caption</h4><div className="txt">{it.caption}</div>
          <div className="hash" style={{ marginTop: 4 }}>{it.hashtag}</div>
          <button className="mini-copy" onClick={() => copy(`${it.caption}\n\n${it.hashtag}`)}>Salin caption sahaja</button>
        </div>
      </>
    );
  } else if (p === "threads") {
    const posts = it.posts || [];
    full = posts.map((x, k) => `${k + 1}/${posts.length}\n${x}`).join("\n\n");
    body = posts.map((x, k) => (
      <div className="thread-part" key={k}>
        <div className="num">BAHAGIAN {k + 1}/{posts.length}</div>
        <div className="txt">{x}</div>
        <button className="mini-copy" onClick={() => copy(x)}>Salin bahagian {k + 1}</button>
      </div>
    ));
  } else {
    full = it.post;
    body = <div className="blk"><div className="txt">{it.post}</div></div>;
  }
  return (
    <div className="result">
      <div className="result-head">
        <span className="tag">{NAME[p]} · Variasi {i + 1}</span>
        <button className="copy" onClick={() => copy(full)}>📋 Salin semua</button>
      </div>
      {body}
    </div>
  );
}
