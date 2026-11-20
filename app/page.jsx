import Link from "next/link";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import Pricing from "@/components/Pricing";
import {
  IconBolt, IconLink, IconSliders, IconCopy, IconClock, IconSparkle, IconLayers, IconGift,
  IconCheckCircle, IconCursor, IconArrowRight,
} from "@/components/Icons";

const MOOD_PILLS = [
  ["📖", "Cerita"], ["🤔", "Curiosity"], ["⏰", "FOMO"], ["⭐", "Review Jujur"],
  ["💡", "Masalah → Solusi"], ["😂", "Kelakar"], ["🌶️", "Hot Take"],
];

export default function Home() {
  return (
    <>
      <Nav landing />

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">AI Copywriting untuk Shopee Affiliate</span>
            <h1 className="display">
              Jimat masa.<br />
              <span className="hl">Tulis lebih laju.</span>
            </h1>
            <p className="lead">
              Tampal link produk Shopee, pilih gaya penulisan dan dapatkan caption TikTok, thread Threads
              dan post Facebook yang siap salin — dalam 10 saat.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary btn-lg italic" href="/masuk?daftar=1"><IconBolt /> Cuba Percuma Sekarang</Link>
              <a className="btn btn-ghost btn-lg" href="#cara">Cara guna</a>
            </div>
            <div className="hero-meta">
              <span><IconClock /> Siap dalam 10 saat</span>
              <span><IconSparkle /> 7 gaya penulisan</span>
              <span><IconGift /> Kredit percuma pengguna baru</span>
            </div>
          </div>

          {/* Contoh hasil (ilustrasi teks, bukan tangkapan skrin produk) */}
          <div className="sample">
            <span className="float-badge fb-1"><IconBolt /> 10 saat</span>
            <div className="card">
              <div className="sample-label"><IconSparkle width={14} height={14} /> Contoh hasil caption</div>
              <div className="sample-link"><IconLink /> s.shopee.com.my/serum-vitamin-c</div>
              <div className="sample-out">
                <b>"Kulit kusam? Aku pun dulu macam tu…"</b>
                <p style={{ marginTop: 8 }}>
                  Seminggu pakai serum ni, kawan-kawan mula tanya pakai apa 😳 Ringan, cepat serap, tak melekit.
                  Tekan beg kuning sebelum promo habis! 🛒
                </p>
                <div className="sample-tags">#SkincareMurah #ShopeeFinds #KulitCerah</div>
              </div>
            </div>
            <span className="float-badge fb-2"><IconCopy /> Salin & terus post</span>
          </div>
        </div>
      </section>

      {/* ---------- MASALAH ---------- */}
      <section className="section">
        <div className="container problem">
          <div>
            <h2 className="display" style={{ fontSize: "clamp(32px,4.6vw,52px)", marginBottom: 24 }}>Jumpa produk best…</h2>
            <div className="bubble">Tapi tak tahu nak tulis caption?</div>
            <div className="empty-box" aria-hidden="true">
              Tulis caption…<br /><span className="cursor" />
              <small>0 / 2,200</small>
            </div>
          </div>
          <div>
            <p className="lead" style={{ marginBottom: 20 }}>
              Ramai affiliate jumpa produk yang bagus, tapi tersekat bila nak tulis ayat. Akhirnya post
              lambat, caption hambar, dan komisen terlepas.
            </p>
            <h3 className="display" style={{ fontSize: 30, marginBottom: 22 }}>
              Jangan pening fikir ayat lagi. <span className="text-yellow">Biar CopyLaju tulis.</span>
            </h3>
            <Link className="btn btn-primary italic" href="/masuk?daftar=1">Mula Sekarang <IconArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ---------- CARA GUNA ---------- */}
      <section className="section" id="cara">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">Mudah gila</span>
            <h2 className="display" style={{ marginTop: 16 }}>Cara guna <span className="hl">CopyLaju</span></h2>
          </div>
          <div className="steps">
            {[
              [IconLink, "Tampal link Shopee", "Copy link dari app Shopee atau TikTok Shop dan tampal. Nama produk dibaca automatik."],
              [IconSliders, "Pilih gaya ayat", "Cerita, FOMO, review jujur atau kelakar. Pilih platform yang anda mahu."],
              [IconBolt, "Jana & terus copy", "Tekan Jana, salin caption dan post. Link affiliate anda dah siap dimasukkan."],
            ].map(([Icon, t, d], i) => (
              <div key={t} className="card-light step">
                <span className="num">{i + 1}</span>
                <div className="icon-tile"><Icon /></div>
                <div><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>
          <div className="stats-strip" style={{ marginTop: 40 }}>
            <div><IconClock /><div><b>Siap dalam 10 saat</b><span>Dari link ke caption</span></div></div>
            <div><IconSparkle /><div><b>7 gaya penulisan</b><span>Ikut citarasa anda</span></div></div>
            <div><IconLayers /><div><b>Sesuai untuk semua</b><span>TikTok, Threads & Facebook</span></div></div>
          </div>
        </div>
      </section>

      {/* ---------- GAYA PENULISAN ---------- */}
      <section className="section" id="gaya">
        <div className="container">
          <div className="sec-head">
            <h2 className="display">Pilih gaya ayat <span className="hl">ikut citarasa</span></h2>
            <p className="lead">Setiap produk lain caranya. Tukar gaya dengan satu klik.</p>
          </div>
          <div className="moods">
            {MOOD_PILLS.map(([e, t]) => (
              <span key={t} className="mood-pill"><span className="e" aria-hidden="true">{e}</span>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CIRI ---------- */}
      <section className="section" id="ciri">
        <div className="container">
          <div className="sec-head">
            <h2 className="display">Kenapa affiliate pilih <span className="text-yellow">CopyLaju</span>?</h2>
          </div>
          <div className="feats">
            {[
              [IconLink, "Auto baca link", "Tampal link Shopee (termasuk link pendek affiliate) dan nama produk dikesan sendiri."],
              [IconLayers, "3 platform sekali gus", "Skrip TikTok, thread Threads 3 bahagian dan post Facebook, ikut format setiap platform."],
              [IconSparkle, "Hook yang menangkap", "Setiap skrip dibuka dengan hook kuat untuk 3 saat pertama supaya orang berhenti scroll."],
              [IconSliders, "7 gaya penulisan", "Cerita, curiosity, FOMO, review jujur, masalah→solusi, kelakar atau hot take."],
              [IconCheckCircle, "Bahasa orang kita", "BM santai, formal, rojak, English atau Indonesia. Bunyi macam manusia, bukan robot."],
              [IconCopy, "Salin terus", "Butang salin untuk setiap caption, hashtag dan setiap bahagian thread."],
            ].map(([Icon, t, d]) => (
              <div key={t} className="card card-hover feat">
                <div className="icon-tile"><Icon /></div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HARGA ---------- */}
      <section className="section" id="harga">
        <div className="container">
          <div className="sec-head">
            <h2 className="display">Pilih <span className="hl">pakej</span> anda</h2>
            <p className="lead">Bayaran sekali. Tiada langganan automatik.</p>
          </div>
          <Pricing />
        </div>
      </section>

      {/* ---------- SOALAN ---------- */}
      <section className="section" id="soalan" style={{ paddingTop: 20 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="sec-head"><h2 className="display">Soalan lazim</h2></div>
          <details className="faq"><summary>Perlu ke saya pandai menulis?</summary><p>Tak perlu langsung. Tampal link produk, pilih gaya, dan AI susun hook, isi dan call-to-action untuk anda.</p></details>
          <details className="faq"><summary>Link apa yang boleh ditampal?</summary><p>Link Shopee (penuh atau pendek s.shopee.com.my), TikTok Shop dan Lazada. Jika nama produk tak dapat dibaca, anda cuma perlu taip nama produk sekali.</p></details>
          <details className="faq"><summary>Adakah pakej diperbaharui secara automatik?</summary><p>Tidak. Semua pakej adalah bayaran sekali. Bila tamat, anda boleh beli semula jika mahu.</p></details>
          <details className="faq"><summary>Bagaimana kuota bulanan berfungsi?</summary><p>Kuota diisi semula setiap 30 hari selagi pakej anda masih aktif. Kuota yang tak digunakan tidak dibawa ke bulan seterusnya.</p></details>
          <details className="faq"><summary>Selamat ke guna caption ni?</summary><p>Ya, tapi sentiasa semak fakta produk. Jangan buat tuntutan kesihatan yang tidak benar, dan ikut garis panduan TikTok Shop serta Shopee Affiliate.</p></details>
        </div>
      </section>

      {/* ---------- CTA AKHIR ---------- */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="cta-final">
            <h2 className="display">Cuba <span className="text-yellow">CopyLaju.com</span> hari ini!</h2>
            <div className="gift"><IconGift /> Kredit percuma untuk pengguna baru</div>
            <div>
              <Link className="btn btn-primary btn-lg italic" href="/masuk?daftar=1"><IconCursor /> Daftar Percuma</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <Logo size={18} />
          <nav aria-label="Pautan kaki">
            <Link href="/terma">Terma & Polisi</Link>
            <Link href="/masuk">Log Masuk</Link>
            <a href="#harga">Harga</a>
          </nav>
          <span>© {new Date().getFullYear()} CopyLaju.com</span>
        </div>
      </footer>
    </>
  );
}
