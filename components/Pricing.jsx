"use client";
import { useEffect, useState } from "react";
import { PLANS, formatRM } from "@/lib/plans";
import { supabaseBrowser, apiFetch } from "@/lib/supabase-browser";

function sessionStorageGet(k) { try { return sessionStorage.getItem(k) || ""; } catch (_) { return ""; } }
function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (_) {} }

export default function Pricing({ profile = null, autoOpen = false }) {
  const [plan, setPlan] = useState(null);
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Isi nama & telefon bila profil dimuatkan
  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.phone) setPhone((p) => p || profile.phone);
  }, [profile]);

  // Datang dari halaman daftar dengan pakej dipilih → buka terus borang bayaran
  useEffect(() => {
    if (!autoOpen) return;
    const id = sessionStorageGet("pakej");
    if (!id) return;
    sessionStorageSet("pakej", "");
    const p = PLANS.find((x) => x.id === id);
    if (p) choose(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choose(p) {
    const { data } = await supabaseBrowser().auth.getSession();
    if (!data.session) {
      sessionStorageSet("pakej", p.id);
      window.location.href = `/masuk?daftar=1&pakej=${p.id}`;
      return;
    }
    setErr("");
    setPlan(p);
  }

  async function pay(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { paymentUrl } = await apiFetch("/api/checkout", { plan: plan.id, name, phone });
      window.location.href = paymentUrl;
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="price-grid">
        {PLANS.map((p, i) => (
          <div key={p.id} className={"price" + (i === 0 ? " hot" : "")}>
            {p.badge && <span className="badge">{p.badge}</span>}
            <h3>{p.name}</h3>
            <div className="amt">{formatRM(p.price_sen)}</div>
            <div className="per">Bayaran sekali · {p.days} hari · tiada auto-caj</div>
            <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <button className={"btn " + (i === 0 ? "btn-coral" : "btn-dark")} onClick={() => choose(p)}>
              Pilih {p.name}
            </button>
          </div>
        ))}
      </div>
      <p className="note">Bayar melalui FPX (online banking) atau kad kredit dengan ToyyibPay. Pakej aktif serta-merta selepas bayaran.</p>

      {plan && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && !busy && setPlan(null)}>
          <form className="modal" onSubmit={pay}>
            <h3>{plan.name}</h3>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>
              {formatRM(plan.price_sen)} · {plan.days} hari · {plan.quota} jana sebulan
            </p>
            {err && <div className="msg bad">{err}</div>}
            <div className="field">
              <label>Nama penuh</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>No. telefon</label>
              <input type="text" inputMode="tel" placeholder="0123456789" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="row">
              <button type="button" className="btn btn-line" disabled={busy} onClick={() => setPlan(null)}>Batal</button>
              <button className="btn btn-coral" disabled={busy}>{busy ? "Menyambung…" : "Bayar Sekarang"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
