# ⚡ CopyLaju — Panduan Pemasangan (Bahasa Melayu)

Website penjana copywriting affiliate (TikTok, Threads, Facebook) dengan **akaun pengguna**, **langganan 1 bulan / 3 bulan / 1 tahun** melalui **ToyyibPay**, dan **AI Claude**.

Anda **tidak perlu tahu coding** untuk pasang. Ikut langkah di bawah satu per satu. Anggaran masa: 1–2 jam.

---

## Apa yang anda perlukan (semua ada pelan percuma untuk mula)

| Perkhidmatan | Untuk apa | Pautan |
|---|---|---|
| GitHub | Simpan kod | https://github.com |
| Vercel | Hos website | https://vercel.com |
| Supabase | Akaun pengguna & database | https://supabase.com |
| Anthropic Console | API key AI Claude (bayar ikut guna) | https://console.anthropic.com |
| ToyyibPay | Terima bayaran FPX / kad | https://toyyibpay.com (sebenar) & https://dev.toyyibpay.com (ujian) |

---

## Langkah 1 — Supabase (database & log masuk)

1. Daftar di supabase.com → **New project**. Pilih region **Southeast Asia (Singapore)**. Simpan kata laluan database.
2. Tunggu projek siap (~2 minit).
3. Klik **SQL Editor** (menu kiri) → **New query**.
4. Buka fail `supabase/schema.sql` dalam folder ini, salin **semua**, tampal, tekan **Run**. Mesti keluar "Success".
5. Pergi **Project Settings → API**. Salin 3 nilai ini ke Notepad:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ RAHSIA, jangan kongsi
6. Pergi **Authentication → Sign In / Providers → Email**:
   - Mahu pengguna sahkan emel dahulu? Biarkan **Confirm email** ON (disyorkan untuk elak akaun palsu ambil kredit percuma).
   - Untuk ujian cepat, boleh OFF dahulu.

> Langkah 1 bahagian URL (Site URL) akan dibuat di Langkah 5 selepas website anda ada alamat.

---

## Langkah 2 — API key Claude (AI)

1. Daftar di console.anthropic.com.
2. **Settings → Billing** → tambah kredit (cth: USD 5 untuk mula).
3. **Settings → Limits** → tetapkan **had belanja bulanan** supaya bil tak terlajak.
4. **API Keys → Create Key** → salin → `ANTHROPIC_API_KEY`.
5. Model: biarkan `ANTHROPIC_MODEL=claude-haiku-5-5` (paling murah & laju). Tukar kepada `claude-sonnet-5-5` jika mahu tulisan lebih bijak, tetapi kos lebih tinggi — lihat bahagian **Kos & Untung**.

---

## Langkah 3 — ToyyibPay (mod UJIAN dahulu)

1. Daftar akaun ujian di **https://dev.toyyibpay.com**.
2. Log masuk → cari **User Secret Key** di halaman profil / API → salin → `TOYYIBPAY_SECRET_KEY`.
3. Cipta **Kategori** (menu Category / Kategori → Create). Nama cth: "Langganan CopyLaju". Salin **Category Code** → `TOYYIBPAY_CATEGORY_CODE`.
4. Tetapkan `TOYYIBPAY_SANDBOX=true`.

Dalam mod ujian, anda boleh "bayar" guna bank ujian tanpa duit sebenar.

---

## Langkah 4 — Muat naik kod ke GitHub

1. Daftar di github.com → **New repository** → nama `copylaju` → **Private** → Create.
2. Klik **uploading an existing file** → seret SEMUA fail & folder dari folder ini (kecuali `node_modules` jika ada) → **Commit changes**.

---

## Langkah 5 — Deploy ke Vercel

1. Daftar di vercel.com guna akaun GitHub.
2. **Add New → Project** → pilih repo `copylaju` → **Import**.
3. Buka **Environment Variables** dan masukkan semua nilai dari fail `.env.example`:

   | Nama | Nilai |
   |---|---|
   | `NEXT_PUBLIC_APP_NAME` | Nama jenama anda, cth `CopyLaju` |
   | `NEXT_PUBLIC_SITE_URL` | Isi dulu `https://copylaju.vercel.app` (tukar selepas dapat alamat sebenar) |
   | `NEXT_PUBLIC_SUPABASE_URL` | dari Langkah 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dari Langkah 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | dari Langkah 1 |
   | `ANTHROPIC_API_KEY` | dari Langkah 2 |
   | `ANTHROPIC_MODEL` | `claude-haiku-5-5` |
   | `TOYYIBPAY_SANDBOX` | `true` |
   | `TOYYIBPAY_SECRET_KEY` | dari Langkah 3 |
   | `TOYYIBPAY_CATEGORY_CODE` | dari Langkah 3 |

4. Tekan **Deploy**. Tunggu ~2 minit. Anda dapat alamat seperti `https://copylaju-xxxx.vercel.app`.
5. Kembali ke **Settings → Environment Variables**, betulkan `NEXT_PUBLIC_SITE_URL` kepada alamat sebenar, kemudian **Deployments → ⋯ → Redeploy**.
6. Di **Supabase → Authentication → URL Configuration**:
   - **Site URL**: alamat website anda
   - **Redirect URLs**: tambah `https://ALAMAT-ANDA/**`

---

## Langkah 6 — Uji semuanya

1. Buka website → **Daftar Percuma** → sahkan emel (jika diaktifkan).
2. Di halaman App, tampal link Shopee → copy mesti keluar. (Kredit percuma: 1)
3. Jana sekali lagi → mesti keluar mesej "Kuota habis".
4. Pilih pakej → isi nama & telefon → **Bayar Sekarang** → anda dibawa ke ToyyibPay ujian → bayar.
5. Selepas bayar, anda kembali ke halaman "Bayaran berjaya!" dan baki jana bertukar kepada 500.
6. Semak di Supabase → **Table Editor → orders**: status `paid`.

---

## Langkah 7 — Mula terima bayaran SEBENAR

1. Daftar akaun sebenar di **https://toyyibpay.com** dan lengkapkan pengesahan akaun mengikut syarat ToyyibPay.
2. Cipta kategori baru di akaun sebenar.
3. Di Vercel, tukar:
   - `TOYYIBPAY_SANDBOX` → `false`
   - `TOYYIBPAY_SECRET_KEY` → key akaun sebenar
   - `TOYYIBPAY_CATEGORY_CODE` → kategori akaun sebenar
4. **Redeploy**. Buat satu pembelian sebenar untuk uji.

> 💡 Lengkapkan halaman **/terma** (fail `app/terma/page.jsx`) dengan nama syarikat, SSM, alamat, emel & polisi bayaran balik anda. Gateway pembayaran biasanya menyemak perkara ini.

---

## Langkah 8 — Domain sendiri (pilihan)

1. Beli domain (cth `copylaju.com` atau `.my`).
2. Vercel → Project → **Settings → Domains** → tambah domain → ikut arahan DNS yang dipaparkan.
3. Kemas kini `NEXT_PUBLIC_SITE_URL` + Supabase **Site URL / Redirect URLs** kepada domain baru → Redeploy.

---

## Cara ubah tetapan

| Nak ubah | Fail |
|---|---|
| Harga, tempoh, kuota, senarai ciri pakej | `lib/plans.js` |
| Bilangan kredit percuma pengguna baru | `supabase/schema.sql` → `free_credits int not null default 1` (tukar nombor, jalankan semula di SQL Editor: `alter table profiles alter column free_credits set default 3;`) |
| Arahan AI / gaya / bahasa | `lib/prompt.js` |
| Teks halaman utama | `app/page.jsx` |
| Warna & reka bentuk | `app/globals.css` (bahagian `:root` di atas) |
| Terma & polisi | `app/terma/page.jsx` |

Selepas ubah fail di GitHub (klik fail → ikon pensel → Commit), Vercel akan deploy semula secara automatik.

**Beri pakej percuma kepada seseorang secara manual:** Supabase → Table Editor → `profiles` → cari emel → ubah `plan` = `1bulan`, `plan_expires_at` = tarikh tamat, `monthly_quota` = 500, `used` = 0, `period_start` = hari ini.

---

## Kos & Untung (anggaran)

Satu kali jana (3 platform × 2 variasi) ≈ 800 token input + 2,500 token output.

| Model | Harga API (USD / sejuta token, input / output) | Kos 1 jana | Kos 500 jana |
|---|---|---|---|
| `claude-haiku-5-5` | $0.10 / $0.50 | ≈ $0.0013 | ≈ $0.67 (≈ RM3) |
| `claude-sonnet-5-5` | $2 / $10 | ≈ $0.027 | ≈ $13.50 (≈ RM58) |

➡️ Dengan **Haiku**, pakej RM39.90 untung besar walaupun pelanggan guna habis kuota. Dengan **Sonnet**, pakej RM39.90 × 500 jana boleh **rugi** — kurangkan kuota atau naikkan harga jika guna Sonnet.

Harga API boleh berubah — semak https://claude.com/pricing. Kadar RM anggaran pada ~RM4.3/USD.

Kos lain: Vercel & Supabase percuma untuk permulaan; caj transaksi ToyyibPay ikut kadar semasa mereka; domain ~RM50–100/tahun.

---

## Bagaimana sistem berfungsi (ringkas)

- **Daftar / log masuk**: Supabase Auth (emel + kata laluan, ada "lupa kata laluan").
- **Jana copy**: pelayar → `/api/generate` → server semak & tolak 1 kredit → buka link Shopee (termasuk link pendek) → panggil Claude → simpan sejarah. Jika AI gagal, kredit dipulangkan.
- **Bayaran**: `/api/checkout` cipta bil ToyyibPay → pelanggan bayar → ToyyibPay panggil `/api/toyyibpay/callback` → server **sahkan semula terus dengan ToyyibPay** (bukan percaya data callback bulat-bulat) dan semak jumlah → pakej diaktifkan. Halaman `/bayaran/selesai` juga menyemak, jadi pakej tetap aktif walaupun callback lambat.
- **Kuota**: diisi semula setiap 30 hari selagi pakej aktif. Beli pakej baru semasa masih aktif → tempoh **ditambah** (tidak hilang).
- **Keselamatan**: API key Claude, service role Supabase & secret ToyyibPay hanya di server. Pengguna hanya boleh baca data sendiri (Row Level Security).

---

## Masalah biasa

| Masalah | Penyelesaian |
|---|---|
| "Ralat pelayan" semasa jana | Semak `SUPABASE_SERVICE_ROLE_KEY` betul & `schema.sql` sudah dijalankan. Lihat Vercel → Logs. |
| "AI sibuk sebentar" | Semak `ANTHROPIC_API_KEY` & baki kredit di console.anthropic.com. |
| "Gagal sambung ke ToyyibPay" | Secret key / category code salah, atau `TOYYIBPAY_SANDBOX` tak sepadan dengan akaun (dev vs sebenar). |
| Dah bayar tapi pakej tak aktif | Pastikan `NEXT_PUBLIC_SITE_URL` betul (callback dihantar ke situ). Buka semula pautan halaman selesai, atau aktifkan manual di Supabase. |
| Emel pengesahan tak sampai | Semak folder spam. Supabase percuma ada had emel sejam — untuk ramai pengguna, sambung SMTP sendiri (Supabase → Authentication → Emails → SMTP). |
| Nama produk tak dikesan dari link pendek | Shopee kadang-kadang sekat bacaan automatik. Pengguna cuma perlu taip nama produk — link tetap dimasukkan ke dalam copy. |
| Pautan emel bawa ke localhost | Betulkan Supabase → Authentication → URL Configuration → Site URL. |

---

## Jalankan di komputer sendiri (pilihan, untuk developer)

```bash
npm install
cp .env.example .env.local   # isi nilai
npm run dev                  # buka http://localhost:3000
```

Nota: callback ToyyibPay tidak sampai ke localhost, tetapi halaman `/bayaran/selesai` akan menyemak & mengaktifkan pakej secara automatik.

---

## Struktur fail

```
app/
  page.jsx                 Halaman utama (landing + harga)
  masuk/page.jsx           Log masuk / daftar / lupa kata laluan
  app/page.jsx             Penjana copy (selepas log masuk)
  bayaran/selesai/page.jsx Halaman selepas bayar
  terma/page.jsx           Terma & polisi
  api/generate             Jana copy (AI)
  api/resolve-link         Baca link pendek Shopee/TikTok
  api/me                   Baki kuota & sejarah
  api/checkout             Cipta bil ToyyibPay
  api/toyyibpay/callback   Terima notifikasi bayaran
  api/order-status         Semak status bayaran
lib/
  plans.js                 ⭐ Harga & pakej
  prompt.js                Arahan AI
  toyyibpay.js             Integrasi ToyyibPay
  anthropic.js             Integrasi Claude API
  linkParser.js / resolveLink.js  Baca link affiliate
supabase/schema.sql        Database
```
