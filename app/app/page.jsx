"use client";
import Link from "next/link";
import { useApp } from "@/components/AppShell";
import { getPlan } from "@/lib/plans";
import { PLAT_NAME } from "@/components/ResultView";
import {
  IconBolt, IconSparkle, IconHistory, IconWallet, IconLayers, IconClock, IconChevron, IconGift, IconChart,
} from "@/components/Icons";

export default function Dashboard() {
  const { me } = useApp();
  const plan = me?.plan ? getPlan(me.plan) : null;
  const firstName = (me?.name || me?.email || "").split(/[ @]/)[0];
  const used = me ? Math.max(0, (me.monthlyQuota || 0) - (me.planLeft || 0)) : 0;
  const pct = me?.monthlyQuota ? Math.round((me.planLeft / me.monthlyQuota) * 100) : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hai{firstName ? `, ${firstName}` : ""} 👋</h1>
          <p>Jom jana caption affiliate yang buat orang berhenti scroll.</p>
        </div>
        <Link href="/app/jana" className="btn btn-primary italic"><IconBolt /> Jana Caption</Link>
      </div>

      {!me ? (
        <div className="stat-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}</div>
      ) : (
        <div className="stat-grid">
          <div className="card stat feature">
            <div className="icon-tile"><IconBolt /></div>
            <small>Baki kredit</small>
            <b>{me.totalLeft}</b>
            <small>{me.freeCredits > 0 ? `Termasuk ${me.freeCredits} kredit percuma` : "1 jana = 1 kredit"}</small>
          </div>
          <div className="card stat">
            <div className="icon-tile"><IconLayers /></div>
            <small>Pakej aktif</small>
            <b style={{ fontSize: 22 }}>{plan ? plan.name : "Percuma"}</b>
            <small>{plan ? `${plan.quota} jana sebulan` : "Naik taraf untuk lebih kredit"}</small>
          </div>
          <div className="card stat">
            <div className="icon-tile"><IconChart /></div>
            <small>Kuota bulan ini</small>
            <b>{plan ? `${me.planLeft}/${me.monthlyQuota}` : "–"}</b>
            {plan ? <div className="bar" aria-label={`${used} digunakan`}><i style={{ width: `${pct}%` }} /></div> : <small>Tiada pakej aktif</small>}
          </div>
          <div className="card stat">
            <div className="icon-tile"><IconClock /></div>
            <small>Pakej tamat</small>
            <b style={{ fontSize: 22 }}>{me.planExpiresAt ? new Date(me.planExpiresAt).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" }) : "–"}</b>
            <small>{me.planExpiresAt ? "Bayaran sekali, tiada auto-caj" : "Belum melanggan"}</small>
          </div>
        </div>
      )}

      <h2 className="section-title">Tindakan pantas</h2>
      <div className="quick">
        <Link href="/app/jana" className="card-light card-hover">
          <div className="icon-tile"><IconSparkle /></div>
          <div><h3>Jana caption baru</h3><p>Tampal link, pilih gaya, siap.</p></div>
        </Link>
        <Link href="/app/sejarah" className="card-light card-hover">
          <div className="icon-tile"><IconHistory /></div>
          <div><h3>Lihat sejarah</h3><p>Salin semula caption lama.</p></div>
        </Link>
        <Link href="/app/kredit" className="card-light card-hover">
          <div className="icon-tile"><IconWallet /></div>
          <div><h3>Tambah kredit</h3><p>Pakej 1 bulan, 3 bulan, 1 tahun.</p></div>
        </Link>
      </div>

      <h2 className="section-title">Caption terkini</h2>
      {me && me.history.length === 0 ? (
        <div className="card empty-state">
          <div className="ic"><IconGift /></div>
          <h3>Belum ada caption</h3>
          <p>{me.totalLeft > 0 ? `Anda ada ${me.totalLeft} kredit. Cuba jana caption pertama anda sekarang!` : "Tambah kredit untuk mula menjana caption."}</p>
          <Link href={me.totalLeft > 0 ? "/app/jana" : "/app/kredit"} className="btn btn-primary italic">
            <IconBolt /> {me.totalLeft > 0 ? "Jana Caption Pertama" : "Tambah Kredit"}
          </Link>
        </div>
      ) : (
        <div className="hist">
          {(me?.history || []).slice(0, 3).map((h) => (
            <Link key={h.id} href="/app/sejarah" className="card card-hover hist-item" style={{ textDecoration: "none" }}>
              <div>
                <b>{h.input.produk}</b>
                <small>{(h.input.plat || []).map((p) => PLAT_NAME[p]).join(", ")} · {new Date(h.created_at).toLocaleString("ms-MY", { dateStyle: "medium", timeStyle: "short" })}</small>
              </div>
              <IconChevron className="chev" />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

