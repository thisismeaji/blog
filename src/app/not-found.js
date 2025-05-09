// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>404 - Halaman Tidak Ditemukan</h1>
      <p>Ups! Halaman yang kamu cari sepertinya tidak tersedia.</p>
      <Link href="/">Kembali ke Beranda</Link>
    </div>
  );
}
