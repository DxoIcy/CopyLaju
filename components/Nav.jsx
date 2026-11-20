"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import Logo from "./Logo";

// Navigasi atas untuk halaman awam (landing, terma, bayaran)
export default function Nav({ landing = false }) {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="topnav">
      <div className="container">
        <Logo />
        {landing && (
          <nav className="links" aria-label="Navigasi utama">
            <a href="/#cara">Cara Guna</a>
            <a href="/#gaya">Gaya Penulisan</a>
            <a href="/#ciri">Ciri-ciri</a>
            <a href="/#harga">Harga</a>
            <a href="/#soalan">Soalan</a>
          </nav>
        )}
        <div className="actions">
          {loggedIn === true && (
            <Link className="btn btn-primary btn-sm" href="/app">Ke Dashboard</Link>
          )}
          {loggedIn === false && (
            <>
              <Link className="btn btn-ghost btn-sm" href="/masuk">Log Masuk</Link>
              <Link className="btn btn-primary btn-sm" href="/masuk?daftar=1">Daftar Percuma</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
