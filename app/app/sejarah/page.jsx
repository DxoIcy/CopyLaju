"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/supabase-browser";
import { useApp } from "@/components/AppShell";
import ResultView, { PLAT_NAME } from "@/components/ResultView";
import { IconChevron, IconHistory, IconBolt } from "@/components/Icons";

export default function SejarahPage() {
  const { copy } = useApp();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    apiFetch("/api/me?limit=100")
      .then((r) => setItems(r.history || []))
      .catch((e) => setErr(e.message || "Tidak dapat memuatkan sejarah."));
  }, []);

  const shown = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    return s ? items.filter((h) => (h.input.produk || "").toLowerCase().includes(s)) : items;
  }, [items, q]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sejarah Caption</h1>
          <p>Semua caption yang pernah anda jana. Klik untuk lihat dan salin semula.</p>
        </div>
        {items && items.length > 0 && (
          <input type="text" placeholder="Cari nama produk…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} aria-label="Cari sejarah" />
        )}
      </div>

      {err && <div className="err">{err}</div>}

      {!items && !err && (
        <div className="hist">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 76 }} />)}</div>
      )}

      {items && items.length === 0 && (
        <div className="card empty-state">
          <div className="ic"><IconHistory /></div>
          <h3>Belum ada sejarah</h3>
          <p>Caption yang anda jana akan disimpan di sini secara automatik.</p>
          <Link href="/app/jana" className="btn btn-primary italic"><IconBolt /> Jana Caption Pertama</Link>
        </div>
      )}

      {items && items.length > 0 && shown.length === 0 && <p className="muted">Tiada hasil untuk "{q}".</p>}

      <div className="hist">
        {shown.map((h) => {
          const isOpen = open === h.id;
          return (
            <div key={h.id} className="card" style={{ padding: 0 }}>
              <button className={"hist-item" + (isOpen ? " open" : "")} style={{ background: "none", border: "none" }} onClick={() => setOpen(isOpen ? null : h.id)} aria-expanded={isOpen}>
                <div>
                  <b>{h.input.produk}</b>
                  <small>
                    {h.input.mood} · {(h.input.plat || []).map((p) => PLAT_NAME[p]).join(", ")} ·{" "}
                    {new Date(h.created_at).toLocaleString("ms-MY", { dateStyle: "medium", timeStyle: "short" })}
                  </small>
                </div>
                <IconChevron className="chev" />
              </button>
              {isOpen && (
                <div style={{ padding: "0 18px 18px" }}>
                  <div className="hist-body"><ResultView data={h.output} input={h.input} copy={copy} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
