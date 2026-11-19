import Link from "next/link";
import Nav from "@/components/Nav";
import Pricing from "@/components/Pricing";

const APP = process.env.NEXT_PUBLIC_APP_NAME || "CopyLaju";

export default function Home() {
  return (
    <>
      <Nav landing />

      <header className="hero wrap" id="top">
        <div className="pill">Untuk affiliate yang malas tulis caption</div>
        <h1>
          Copywriting <span className="hl">viral</span> siap dalam <span className="co">10 saat</span>.
        </h1>
        <p>
          Tampal link affiliate Shopee, pilih gaya, dan dapat skrip TikTok, thread Threads dan post Facebook
          yang siap salin dan tampal. Tak perlu pandai menulis.
        </p>
        <div className="ctas">
          <Link className="btn btn-coral" href="/masuk?daftar=1">✍️ Cuba Percuma Sekarang</Link>
          <a className="btn btn-dark" href="#harga">Lihat Harga</a>
        </div>
        <p style={{ fontSize: 14, marginTop: 16 }}>Daftar percuma dan terus dapat kredit jana pertama.</p>
        <div className="platforms">
          <div className="plat">🎵 TikTok</div>
          <div className="plat">🧵 Threads</div>
          <div className="plat">📘 Facebook</div>
        </div>
      </header>

      <section id="cara">
        <div className="wrap">
          <div className="sec-head"><h2>3 langkah. Itu saja.</h2><p>Dari link ke post viral tanpa pening kepala.</p></div>
          <div className="steps">
            <div className="step"><div className="n">01</div><h3>Tampal link affiliate</h3><p>Copy link dari app Shopee atau TikTok Shop dan tampal. Nama produk dan harga dibaca secara automatik.</p></div>
            <div className="step"><div className="n">02</div><h3>Pilih gaya &amp; platform</h3><p>Cerita, FOMO, review jujur atau kelakar? Pilih TikTok, Threads, Facebook atau ketiga-tiga sekali.</p></div>
            <div className="step"><div className="n">03</div><h3>Salin &amp; post</h3><p>Tekan Salin, tampal di app, dan post. Link affiliate anda dah siap dimasukkan.</p></div>
          </div>
        </div>
      </section>

      <section id="ciri">
        <div className="wrap">
          <div className="sec-head"><h2>Kenapa guna {APP}?</h2><p>Dibina khas untuk affiliate &amp; peniaga Malaysia.</p></div>
          <div className="feats">
            <div className="feat"><div className="ic" style={{ background: "var(--lime)" }}>🔗</div><h3>Auto baca link</h3><p>Tampal link Shopee (termasuk link pendek affiliate) dan nama produk dikesan sendiri.</p></div>
            <div className="feat"><div className="ic" style={{ background: "#ffd9cf" }}>📱</div><h3>3 platform sekali gus</h3><p>Skrip TikTok, thread Threads 3 bahagian dan post Facebook, ikut format setiap platform.</p></div>
            <div className="feat"><div className="ic" style={{ background: "var(--sky)" }}>🪝</div><h3>Hook yang menangkap</h3><p>Setiap skrip dibuka dengan hook kuat untuk 3 saat pertama supaya orang berhenti scroll.</p></div>
            <div className="feat"><div className="ic" style={{ background: "#efe3ff" }}>🎭</div><h3>7 gaya penulisan</h3><p>Cerita, curiosity, FOMO, review jujur, masalah→solusi, kelakar atau hot take.</p></div>
            <div className="feat"><div className="ic" style={{ background: "#fff1b8" }}>🇲🇾</div><h3>Bahasa orang kita</h3><p>BM santai, formal, rojak, English atau Indonesia. Bunyi macam manusia, bukan robot.</p></div>
            <div className="feat"><div className="ic" style={{ background: "#d6f5e3" }}>📋</div><h3>Salin terus</h3><p>Butang salin untuk setiap copy, caption, hashtag dan setiap bahagian thread.</p></div>
          </div>
        </div>
      </section>

      <section id="harga">
        <div className="wrap">
          <div className="sec-head"><h2>Pilih pakej anda</h2><p>Bayaran sekali. Tiada langganan automatik.</p></div>
          <Pricing />
        </div>
      </section>

      <section id="soalan" style={{ paddingTop: 20 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="sec-head"><h2>Soalan lazim</h2></div>
          <details><summary>Perlu ke saya pandai menulis?</summary><p>Tak perlu langsung. Tampal link produk, pilih gaya, dan AI susun hook, isi dan call-to-action untuk anda.</p></details>
          <details><summary>Link apa yang boleh ditampal?</summary><p>Link Shopee (penuh atau pendek s.shopee.com.my), TikTok Shop dan Lazada. Jika nama produk tak dapat dibaca, anda cuma perlu taip nama produk sekali.</p></details>
          <details><summary>Adakah pakej diperbaharui secara automatik?</summary><p>Tidak. Semua pakej adalah bayaran sekali. Bila tamat, anda boleh beli semula jika mahu.</p></details>
          <details><summary>Bagaimana kuota bulanan berfungsi?</summary><p>Kuota diisi semula setiap 30 hari selagi pakej anda masih aktif. Kuota yang tak digunakan tidak dibawa ke bulan seterusnya.</p></details>
          <details><summary>Selamat ke guna copy ni?</summary><p>Ya, tapi sentiasa semak fakta produk. Jangan buat tuntutan kesihatan yang tidak benar, dan ikut garis panduan TikTok Shop serta Shopee Affiliate.</p></details>
        </div>
      </section>

      <footer>
        <div className="wrap">
          © {new Date().getFullYear()} {APP} · <Link href="/terma">Terma &amp; Polisi Bayaran Balik</Link> · <Link href="/masuk">Log Masuk</Link>
        </div>
      </footer>
    </>
  );
}
