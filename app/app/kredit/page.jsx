"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/supabase-browser";
import { useApp } from "@/components/AppShell";
import Pricing from "@/components/Pricing";
import { getPlan, formatRM } from "@/lib/plans";
import { IconBolt, IconGift, IconLayers, IconClock } from "@/components/Icons";

const STATUS = {
  paid: { t: "Berjaya", c: "#a7f3c4" },
  pending: { t: "Menunggu", c: "#ffef5c" },
  failed: { t: "Gagal", c: "#ffc3cd" },
};

export default function KreditPage() {
  const { me } = useApp();
  const [orders, setOrders] = useState(null);
  const plan = me?.plan ? getPlan(me.plan) : null;

  useEffect(() => {
    apiFetch("/api/orders").then((r) => setOrders(r.orders)).catch(() => setOrders([]));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kredit</h1>
          <p>Semak baki kredit dan beli pakej. Bayaran sekali, tiada auto-caj.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))" }}>
        <div className="card stat feature">
          <div className="icon-tile"><IconBolt /></div>
          <small>Jumlah baki kredit</small>
          <b>{me ? me.totalLeft : "–"}</b>
        </div>
        <div className="card stat">
          <div className="icon-tile"><IconLayers /></div>
          <small>Kuota pakej bulan ini</small>
          <b>{plan ? `${me.planLeft}/${me.monthlyQuota}` : "–"}</b>
          <small>{plan ? plan.name : "Tiada pakej aktif"}</small>
        </div>
        <div className="card stat">
          <div className="icon-tile"><IconGift /></div>
          <small>Kredit percuma</small>
          <b>{me ? me.freeCredits : "–"}</b>
        </div>
        <div className="card stat">
          <div className="icon-tile"><IconClock /></div>
          <small>Pakej tamat</small>
          <b style={{ fontSize: 20 }}>{me?.planExpiresAt ? new Date(me.planExpiresAt).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" }) : "–"}</b>
        </div>
      </div>

      <h2 className="section-title">Beli pakej kredit</h2>
      <p className="muted" style={{ marginTop: -8, marginBottom: 28 }}>
        Beli pakej baru semasa pakej masih aktif? Tempoh akan <b style={{ color: "#fff" }}>ditambah</b>, tidak hilang.
      </p>
      <Pricing profile={me} autoOpen />

      <h2 className="section-title">Sejarah pembelian</h2>
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        {!orders ? (
          <div className="skeleton" style={{ height: 80, margin: 16 }} />
        ) : orders.length === 0 ? (
          <p className="muted" style={{ padding: 22 }}>Belum ada pembelian.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                {["Tarikh", "Pakej", "Jumlah", "Status", "Rujukan"].map((h) => (
                  <th key={h} style={{ padding: "14px 18px", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.ref}>
                  <td style={td}>{new Date(o.created_at).toLocaleDateString("ms-MY")}</td>
                  <td style={td}>{getPlan(o.plan)?.name || o.plan}</td>
                  <td style={td}>{formatRM(o.amount_sen)}</td>
                  <td style={{ ...td, color: (STATUS[o.status] || STATUS.pending).c, fontWeight: 600 }}>{(STATUS[o.status] || STATUS.pending).t}</td>
                  <td style={{ ...td, color: "var(--muted)", fontFamily: "monospace" }}>{o.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const td = { padding: "13px 18px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
