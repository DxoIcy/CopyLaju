"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
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

  const next = "/app" + (params.get("pakej") ? "#harga" : "");

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
      <div className="auth-wrap">
        <form className="auth" onSubmit={setNewPassword}>
          <h1>Kata laluan baru</h1>
          <p className="sub">Masukkan kata laluan baru untuk akaun anda.</p>
          {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}
          <div className="field"><label>Kata laluan baru</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required /></div>
          <button className="btn btn-coral" disabled={busy}>{busy ? "Sila tunggu…" : "Simpan & Masuk"}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <form className="auth" onSubmit={submit}>
        <h1>{lupa ? "Lupa kata laluan" : daftar ? "Daftar percuma" : "Log masuk"}</h1>
        <p className="sub">
          {lupa ? "Masukkan emel anda untuk set semula kata laluan." : daftar ? "Dapat kredit percuma untuk cuba jana copy pertama anda." : "Selamat kembali! Jom jana copy."}
        </p>
        {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}
        {daftar && !lupa && (
          <div className="field"><label>Nama</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        )}
        <div className="field"><label>Emel</label><input type="text" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} required /></div>
        {!lupa && (
          <div className="field"><label>Kata laluan</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required /></div>
        )}
        <button className="btn btn-coral" disabled={busy}>
          {busy ? "Sila tunggu…" : lupa ? "Hantar pautan" : daftar ? "Daftar & Mula" : "Log Masuk"}
        </button>
        <div className="switch">
          {lupa ? (
            <button type="button" onClick={() => { setLupa(false); setMsg(null); }}>← Kembali ke log masuk</button>
          ) : daftar ? (
            <>Dah ada akaun? <button type="button" onClick={() => { setDaftar(false); setMsg(null); }}>Log masuk</button></>
          ) : (
            <>
              Belum ada akaun? <button type="button" onClick={() => { setDaftar(true); setMsg(null); }}>Daftar percuma</button>
              <br />
              <button type="button" onClick={() => { setLupa(true); setMsg(null); }} style={{ marginTop: 8, color: "var(--muted)", fontWeight: 600 }}>Lupa kata laluan?</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default function MasukPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </>
  );
}
