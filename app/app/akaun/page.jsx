"use client";
import { useEffect, useState } from "react";
import { apiFetch, supabaseBrowser } from "@/lib/supabase-browser";
import { useApp } from "@/components/AppShell";
import { getPlan } from "@/lib/plans";
import { IconUser, IconLock, IconLogout } from "@/components/Icons";

export default function AkaunPage() {
  const { me, reload, toast, logout } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [pBusy, setPBusy] = useState(false);
  const [pMsg, setPMsg] = useState(null);

  useEffect(() => {
    if (me) { setName(me.name || ""); setPhone(me.phone || ""); }
  }, [me]);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await apiFetch("/api/profile", { name, phone });
      await reload();
      setMsg({ ok: true, t: "Profil disimpan." });
      toast("Profil disimpan ✅");
    } catch (e2) {
      setMsg({ ok: false, t: e2.message });
    }
    setBusy(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPMsg(null);
    if (pass.length < 6) return setPMsg({ ok: false, t: "Kata laluan mesti sekurang-kurangnya 6 aksara." });
    if (pass !== pass2) return setPMsg({ ok: false, t: "Kata laluan tidak sepadan." });
    setPBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pass });
    setPBusy(false);
    if (error) setPMsg({ ok: false, t: "Gagal tukar kata laluan. Cuba lagi." });
    else { setPass(""); setPass2(""); setPMsg({ ok: true, t: "Kata laluan berjaya ditukar." }); }
  }

  const plan = me?.plan ? getPlan(me.plan) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Akaun</h1>
          <p>Urus profil dan tetapan akaun anda.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", alignItems: "start" }}>
        <form className="card" onSubmit={saveProfile}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div className="icon-tile"><IconUser /></div>
            <h2 style={{ fontSize: 20, fontStyle: "italic" }}>Profil</h2>
          </div>
          {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}
          <div className="field">
            <label htmlFor="ak-email">Emel</label>
            <input id="ak-email" type="email" value={me?.email || ""} disabled />
          </div>
          <div className="field">
            <label htmlFor="ak-name">Nama penuh</label>
            <input id="ak-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="ak-phone">No. telefon <small>(untuk bil pembayaran)</small></label>
            <input id="ak-phone" type="tel" autoComplete="tel" placeholder="0123456789" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={busy || !me}>{busy ? "Menyimpan…" : "Simpan Profil"}</button>
        </form>

        <div style={{ display: "grid", gap: 20 }}>
          <form className="card" onSubmit={changePassword}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <div className="icon-tile"><IconLock /></div>
              <h2 style={{ fontSize: 20, fontStyle: "italic" }}>Tukar kata laluan</h2>
            </div>
            {pMsg && <div className={"msg " + (pMsg.ok ? "ok" : "bad")}>{pMsg.t}</div>}
            <div className="field">
              <label htmlFor="ak-p1">Kata laluan baru</label>
              <input id="ak-p1" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required />
            </div>
            <div className="field">
              <label htmlFor="ak-p2">Sahkan kata laluan baru</label>
              <input id="ak-p2" type="password" autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} minLength={6} required />
            </div>
            <button className="btn btn-ghost" disabled={pBusy}>{pBusy ? "Menukar…" : "Tukar Kata Laluan"}</button>
          </form>

          <div className="card">
            <h2 style={{ fontSize: 20, fontStyle: "italic", marginBottom: 16 }}>Maklumat akaun</h2>
            <dl className="kv">
              <dt>Pakej</dt><dd>{plan ? plan.name : "Percuma"}</dd>
              <dt>Baki kredit</dt><dd>{me ? me.totalLeft : "–"}</dd>
              <dt>Ahli sejak</dt><dd>{me?.createdAt ? new Date(me.createdAt).toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" }) : "–"}</dd>
            </dl>
            <div className="divider" />
            <button className="btn btn-ghost btn-sm" onClick={logout}><IconLogout /> Log Keluar</button>
          </div>
        </div>
      </div>
    </>
  );
}
