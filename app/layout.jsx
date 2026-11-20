import "./globals.css";

const APP = process.env.NEXT_PUBLIC_APP_NAME || "CopyLaju";

export const viewport = { themeColor: "#180638" };

export const metadata = {
  title: `${APP} — Penjana Copywriting Affiliate`,
  description:
    "Tampal link affiliate Shopee, dapat skrip TikTok, thread Threads & post Facebook yang siap salin dalam 10 saat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:ital,wght@0,600;0,700;0,800;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
