"use client";
import { useEffect, useState } from "react";
import { IconCopy } from "./Icons";

export const PLAT_NAME = { tiktok: "TikTok", threads: "Threads", facebook: "Facebook" };
export const PLAT_ICON = { tiktok: "🎵", threads: "🧵", facebook: "📘" };

// Paparan hasil caption (tab platform + kad bagi setiap variasi)
export default function ResultView({ data, input, copy }) {
  const plats = (input?.plat || ["tiktok", "threads", "facebook"]).filter(
    (p) => Array.isArray(data?.[p]) && data[p].length
  );
  const [tab, setTab] = useState(plats[0]);
  useEffect(() => {
    if (!plats.includes(tab)) setTab(plats[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!plats.length) return <div className="err">Tiada hasil untuk dipaparkan.</div>;
  const items = data[tab] || [];

  return (
    <div>
      <div className="out-tabs" role="tablist">
        {plats.map((p) => (
          <button key={p} role="tab" aria-selected={p === tab} className={"out-tab" + (p === tab ? " on" : "")} onClick={() => setTab(p)}>
            <span aria-hidden="true">{PLAT_ICON[p]}</span> {PLAT_NAME[p]} <span className="n">{data[p].length}</span>
          </button>
        ))}
      </div>
      {items.map((it, i) => (
        <ResultCard key={tab + i} p={tab} it={it} i={i} copy={copy} />
      ))}
    </div>
  );
}

function ResultCard({ p, it, i, copy }) {
  const [done, setDone] = useState(false);
  let full = "";
  let body = null;

  if (p === "tiktok") {
    full = `HOOK:\n${it.hook}\n\nSKRIP:\n${it.skrip}\n\nCAPTION:\n${it.caption}\n${it.hashtag}`;
    body = (
      <>
        <div className="blk"><h4>Hook · 3 saat pertama</h4><div className="hook">{it.hook}</div></div>
        <div className="blk"><h4>Skrip video</h4><div className="txt">{it.skrip}</div></div>
        <div className="blk">
          <h4>Caption</h4>
          <div className="txt">{it.caption}</div>
          <div className="hash">{it.hashtag}</div>
          <button className="mini-copy" onClick={() => copy(`${it.caption}\n\n${it.hashtag}`)}>
            <IconCopy width={13} height={13} /> Salin caption sahaja
          </button>
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
        <button className="mini-copy" onClick={() => copy(x)}>
          <IconCopy width={13} height={13} /> Salin bahagian {k + 1}
        </button>
      </div>
    ));
  } else {
    full = it.post;
    body = <div className="blk"><div className="txt">{it.post}</div></div>;
  }

  async function copyAll() {
    const ok = await copy(full);
    if (ok) { setDone(true); setTimeout(() => setDone(false), 1500); }
  }

  return (
    <article className="result">
      <div className="result-head">
        <span className="tag">{PLAT_ICON[p]} {PLAT_NAME[p]} · Variasi {i + 1}</span>
        <button className={"copy" + (done ? " done" : "")} onClick={copyAll}>
          <IconCopy /> {done ? "Disalin!" : "Salin semua"}
        </button>
      </div>
      {body}
    </article>
  );
}
