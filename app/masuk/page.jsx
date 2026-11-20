"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { IconCheckCircle, IconGift } from "@/components/Icons";
import { supabaseBrowser } from "@/lib/supabase-browser";

function AuthForm() {
  const params = useSearchParams();
  const [daftar, setDaftar] = useState(params.get("daftar") === "1");
  const [lupa, setLupa] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [recovery, setRecovery] = useState(false);

  const next = params.get("pakej") ? "/app/kredit" : "/app";

  useEffect(() => {
    const sb = supabaseBrowser();
    // Datang dari pautan "set semula kata laluan" dalam emel
    const isRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery");
    if (isRecovery) setRecovery(true);
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    if (!isRecovery) {
      sb.auth.getSession().then(({ data }) => {
        if (data.session) window.location.href = next;
      });
    }
    return () => sub.subscription.unsubscribe();
  }, [next]);

  async function setNewPassword(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pass });
    setBusy(false);
    if (error) setMsg({ ok: false, t: "Gagal tukar kata laluan. Minimum 6 aksara, atau minta pautan baru." });
    else window.location.href = "/app";
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const sb = supabaseBrowser();
    try {
      if (lupa) {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/masuk` });
        if (error) throw error;
        setMsg({ ok: true, t: "Pautan set semula kata laluan telah dihantar ke emel anda." });
      } else if (daftar) {
        const { data, error } = await sb.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}${next}` },
        });
        if (error) throw error;
        if (data.session) window.location.href = next;
        else setMsg({ ok: true, t: "Hampir siap! Semak emel anda dan klik pautan pengesahan untuk aktifkan akaun." });
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        window.location.href = next;
      }
    } catch (err) {
      const m = String(err.message || "");
      let t = "Ralat. Sila cuba lagi.";
      if (/invalid login/i.test(m)) t = "Emel atau kata laluan salah.";
      else if (/already registered/i.test(m)) t = "Emel ini sudah didaftarkan. Sila log masuk.";
      else if (/password/i.test(m)) t = "Kata laluan mesti sekurang-kurangnya 6 aksara.";
      else if (/not confirmed/i.test(m)) t = "Sila sahkan emel anda dahulu (semak inbox / spam).";
      setMsg({ ok: false, t });
    }
    setBusy(false);
  }

  if (recovery) {
    return (
      <AuthLayout>
        <form className="auth-card" onSubmit={setNewPassword}>
          <h1>Kata laluan baru</h1>
          <p className="sub">Masukkan kata laluan baru untuk akaun anda.</p>
          {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}
          <div className="field">
            <label htmlFor="np">Kata laluan baru</label>
            <input id="np" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required />
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? "Sila tunggu…" : "Simpan & Masuk"}</button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit}>
        <h1>{lupa ? "Lupa kata laluan" : daftar ? "Daftar percuma" : "Log masuk"}</h1>
        <p className="sub">
          {lupa ? "Masukkan emel anda untuk set semula kata laluan." : daftar ? "Dapat kredit percuma untuk cuba jana caption pertama anda." : "Selamat kembali! Jom jana caption."}
        </p>
        {daftar && !lupa && (
          <div className="msg ok" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <IconGift width={20} height={20} /> Kredit percuma untuk pengguna baru
          </div>
        )}
        {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}
        {daftar && !lupa && (
          <div className="field">
            <label htmlFor="nm">Nama</label>
            <input id="nm" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label htmlFor="em">Emel</label>
          <input id="em" type="email" autoComplete="email" inputMode="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value.trim())} required />
        </div>
        {!lupa && (
          <div className="field">
            <label htmlFor="pw">Kata laluan</label>
            <input id="pw" type="password" autoComplete={daftar ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required />
          </div>
        )}
        {!lupa && !daftar && (
          <div style={{ textAlign: "right", marginTop: -6, marginBottom: 16 }}>
            <button type="button" className="linkbtn muted" onClick={() => { setLupa(true); setMsg(null); }}>Lupa kata laluan?</button>
          </div>
        )}
        <button className="btn btn-primary btn-lg btn-block italic" disabled={busy}>
          {busy ? "Sila tunggu…" : lupa ? "Hantar pautan" : daftar ? "Daftar & Mula" : "Log Masuk"}
        </button>
        <div className="auth-switch">
          {lupa ? (
            <button type="button" className="linkbtn" onClick={() => { setLupa(false); setMsg(null); }}>← Kembali ke log masuk</button>
          ) : daftar ? (
            <>Dah ada akaun? <button type="button" className="linkbtn" onClick={() => { setDaftar(false); setMsg(null); }}>Log masuk</button></>
          ) : (
            <>Belum ada akaun? <button type="button" className="linkbtn" onClick={() => { setDaftar(true); setMsg(null); }}>Daftar percuma</button></>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Logo size={26} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow">AI Copywriting untuk Shopee Affiliate</span>
          <h2 className="display">Jimat masa.<br /><span className="hl">Tulis lebih laju.</span></h2>
          <ul>
            <li><IconCheckCircle /> Tampal link Shopee, caption siap dalam 10 saat</li>
            <li><IconCheckCircle /> 7 gaya penulisan ikut citarasa</li>
            <li><IconCheckCircle /> Sesuai untuk TikTok, Threads & Facebook</li>
          </ul>
        </div>
        <small className="muted" style={{ position: "relative", zIndex: 1 }}>© {new Date().getFullYear()} CopyLaju.com</small>
      </aside>
      <main className="auth-main">
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div className="auth-mobile-logo"><Logo size={24} /></div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
