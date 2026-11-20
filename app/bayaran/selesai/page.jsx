"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { apiFetch } from "@/lib/supabase-browser";
import { IconCheckCircle, IconBolt, IconClock, IconWallet } from "@/components/Icons";

function Result() {
  const params = useSearchParams();
  const billcode = params.get("billcode");
  const statusId = params.get("status_id"); // 1 berjaya, 2 pending, 3 gagal
  const [state, setState] = useState("checking");

  useEffect(() => {
    if (!billcode) { setState("failed"); return; }
    if (statusId === "3") { setState("failed"); return; }
    let tries = 0;
    let stop = false;
    async function check() {
      try {
        const r = await apiFetch("/api/order-status", { billcode });
        if (r.status === "paid") { setState("paid"); return; }
      } catch (_) {}
      tries++;
      if (!stop && tries < 8) setTimeout(check, 3000);
      else if (!stop) setState("pending");
    }
    check();
    return () => { stop = true; };
  }, [billcode, statusId]);

  return (
    <div className="center-page">
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: "40px 28px" }}>
        {state === "checking" && (
          <>
            <div className="dots" style={{ marginBottom: 22 }}><i /><i /><i /></div>
            <h1>Sedang sahkan bayaran…</h1>
            <p>Sila tunggu beberapa saat.</p>
          </>
        )}
        {state === "paid" && (
          <>
            <div className="ic"><IconCheckCircle /></div>
            <h1>Bayaran berjaya!</h1>
            <p>Pakej anda sudah aktif. Jom jana caption viral sekarang.</p>
            <Link className="btn btn-primary btn-lg italic" href="/app/jana"><IconBolt /> Mula Jana</Link>
          </>
        )}
        {state === "pending" && (
          <>
            <div className="ic"><IconClock /></div>
            <h1>Bayaran sedang diproses</h1>
            <p>Pakej akan aktif secara automatik sebaik sahaja bank mengesahkan bayaran. Semak semula dalam beberapa minit.</p>
            <Link className="btn btn-ghost" href="/app/kredit">Ke halaman Kredit</Link>
          </>
        )}
        {state === "failed" && (
          <>
            <div className="ic" style={{ color: "var(--bad)", background: "rgba(255,122,144,.12)" }}><IconWallet /></div>
            <h1>Bayaran tidak berjaya</h1>
            <p>Tiada caj dikenakan. Anda boleh cuba semula.</p>
            <Link className="btn btn-primary" href="/app/kredit">Cuba Lagi</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function Selesai() {
  return (
    <>
      <Nav />
      <Suspense fallback={null}><Result /></Suspense>
    </>
  );
}
