"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const APP = process.env.NEXT_PUBLIC_APP_NAME || "CopyLaju";

export default function Nav({ landing = false }) {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav>
      <div className="wrap">
        <Link className="logo" href="/"><b>⚡</b>{APP}</Link>
        {landing && (
          <div className="links">
            <a href="/#cara">Cara Guna</a>
            <a href="/#ciri">Ciri-ciri</a>
            <a href="/#harga">Harga</a>
            <a href="/#soalan">Soalan</a>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {loggedIn === true && (
            <>
              {landing ? (
                <Link className="btn btn-dark" href="/app" style={{ padding: "9px 18px", fontSize: 14 }}>Buka App</Link>
              ) : (
                <button className="btn btn-line" onClick={logout} style={{ padding: "8px 16px", fontSize: 14 }}>Log Keluar</button>
              )}
            </>
          )}
          {loggedIn === false && (
            <>
              <Link className="btn btn-line" href="/masuk" style={{ padding: "8px 16px", fontSize: 14 }}>Log Masuk</Link>
              <Link className="btn btn-dark" href="/masuk?daftar=1" style={{ padding: "9px 18px", fontSize: 14 }}>Daftar Percuma</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
