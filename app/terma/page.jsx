import Nav from "@/components/Nav";

const APP = process.env.NEXT_PUBLIC_APP_NAME || "CopyLaju";

// CONTOH sahaja — sila semak & ubah ikut bisnes anda.
// ToyyibPay biasanya minta website ada terma, polisi privasi & polisi bayaran balik.
export const metadata = { title: `Terma & Polisi — ${APP}` };

export default function Terma() {
  return (
    <>
      <Nav />
      <div className="prose">
        <h1>Terma Perkhidmatan &amp; Polisi</h1>
        <p>Dikemas kini: [TARIKH]. Perkhidmatan ini dikendalikan oleh [NAMA SYARIKAT / PERNIAGAAN], [NO. PENDAFTARAN SSM], [ALAMAT]. Hubungi kami di [EMEL] / [NO. TELEFON].</p>

        <h2>1. Perkhidmatan</h2>
        <p>{APP} menjana cadangan teks pemasaran menggunakan kecerdasan buatan (AI). Pengguna bertanggungjawab menyemak ketepatan fakta sebelum menerbitkan kandungan, dan mematuhi garis panduan platform (TikTok, Meta, Shopee dan lain-lain) serta undang-undang Malaysia.</p>

        <h2>2. Pakej &amp; bayaran</h2>
        <ul>
          <li>Semua pakej adalah bayaran sekali melalui ToyyibPay. Tiada caj berulang automatik.</li>
          <li>Pakej aktif serta-merta selepas bayaran disahkan, untuk tempoh yang dinyatakan.</li>
          <li>Kuota jana diisi semula setiap 30 hari selagi pakej aktif. Kuota tidak dibawa ke tempoh seterusnya.</li>
        </ul>

        <h2>3. Polisi bayaran balik</h2>
        <p>[Contoh: Bayaran balik penuh boleh dipohon dalam masa 7 hari selepas pembelian jika kurang daripada 10 jana telah digunakan. Hubungi [EMEL] dengan rujukan bil anda.]</p>

        <h2>4. Privasi</h2>
        <p>Kami menyimpan emel, nama, nombor telefon dan sejarah copy anda untuk menyediakan perkhidmatan. Maklumat input dihantar kepada penyedia AI untuk menjana teks. Kami tidak menjual data anda kepada pihak ketiga.</p>

        <h2>5. Penggunaan yang dilarang</h2>
        <p>Dilarang menggunakan perkhidmatan untuk kandungan palsu, mengelirukan, tuntutan kesihatan yang tidak sah, atau apa-apa yang melanggar undang-undang.</p>
      </div>
    </>
  );
}
