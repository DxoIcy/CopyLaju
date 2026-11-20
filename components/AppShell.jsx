"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabaseBrowser, apiFetch } from "@/lib/supabase-browser";
import Logo from "./Logo";
import {
  IconHome, IconSparkle, IconHistory, IconWallet, IconUser, IconLogout, IconBolt,
} from "./Icons";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export const NAV = [
  { href: "/app", label: "Dashboard", short: "Utama", Icon: IconHome },
  { href: "/app/jana", label: "Jana Caption", short: "Jana", Icon: IconSparkle },
  { href: "/app/sejarah", label: "Sejarah", short: "Sejarah", Icon: IconHistory },
  { href: "/app/kredit", label: "Kredit", short: "Kredit", Icon: IconWallet },
  { href: "/app/akaun", label: "Akaun", short: "Akaun", Icon: IconUser },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const reload = useCallback(async () => {
    try {
      const data = await apiFetch("/api/me");
      setMe(data);
      return data;
    } catch (e) {
      if (e.status === 401) window.location.href = "/masuk";
      return null;
    }
  }, []);

  // Pengawal log masuk: hanya pengguna yang log masuk boleh buka /app
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/masuk";
      else { setReady(true); reload(); }
    });
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") window.location.href = "/masuk";
    });
    return () => sub.subscription.unsubscribe();
  }, [reload]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1800);
  }, []);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Disalin! Tampal di app 📲");
      return true;
    } catch (_) {
      toast("Tak dapat salin. Pilih teks & salin manual.");
      return false;
    }
  }, [toast]);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  const isActive = (href) => (href === "/app" ? pathname === "/app" : pathname?.startsWith(href));
  const credit = me ? me.totalLeft : "–";

  return (
    <AppCtx.Provider value={{ me, reload, toast, copy, ready, logout }}>
      <div className="shell">
        <aside className="sidebar" aria-label="Menu aplikasi">
          <Logo href="/app" />
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={"side-link" + (isActive(href) ? " active" : "")}>
              <Icon /> {label}
            </Link>
          ))}
          <div className="side-credit">
            <small>Baki kredit</small>
            <b>{credit}</b>
            <Link href="/app/kredit" className="btn btn-primary btn-sm btn-block">Tambah Kredit</Link>
          </div>
          <button className="side-link side-out" onClick={logout}>
            <IconLogout /> Log Keluar
          </button>
        </aside>

        <div style={{ minWidth: 0 }}>
          <header className="mobile-top">
            <Logo href="/app" />
            <Link href="/app/kredit" className="credit-chip" aria-label={`Baki kredit ${credit}`}>
              <IconBolt /> {credit}
            </Link>
          </header>

          <main className="main">
            {ready ? children : <div className="skeleton" style={{ height: 320 }} />}
          </main>
        </div>

        <nav className="tabbar" aria-label="Menu aplikasi">
          {NAV.map(({ href, short, Icon }) => (
            <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
              <Icon /> {short}
            </Link>
          ))}
        </nav>
      </div>
      <div className={"toast" + (toastMsg ? " show" : "")} role="status" aria-live="polite">{toastMsg}</div>
    </AppCtx.Provider>
  );
}
