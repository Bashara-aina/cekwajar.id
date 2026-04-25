import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TrustBadges } from "@/components/TrustBadges";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan — cekwajar.id",
  description:
    "Syarat dan Ketentuan penggunaan cekwajar.id. Platform referensi data gaji, slip gaji, properti, dan biaya hidup.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        icon={FileText}
        title="Syarat dan Ketentuan"
        description="Terakhir diperbarui: 1 Maret 2026"
      />
      <TrustBadges />

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Penerimaan Syarat</h2>
          <p className="text-muted-foreground">
            Dengan menggunakan cekwajar.id, Anda menyetujui syarat dan ketentuan ini.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Deskripsi Layanan</h2>
          <p className="text-muted-foreground">
            cekwajar.id adalah platform data referensi untuk perbandingan gaji, analisis slip gaji,
            harga properti, biaya hidup, dan perbandingan gaji luar negeri.
          </p>
        </section>

        <section className="space-y-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">3. DISCLAIMER PENTING</h2>
          <p className="text-muted-foreground font-medium mb-2">cekwajar.id BUKAN:</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-3">
            <li>Konsultan pajak berlisensi (PKP)</li>
            <li>Penilai properti berlisensi (KJPP)</li>
            <li>Penasihat keuangan berlisensi (OJK)</li>
          </ul>
          <p className="text-muted-foreground font-medium mb-2">Semua hasil yang ditampilkan:</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-3">
            <li>Bersifat <strong>informasional dan edukatif saja</strong></li>
            <li>Bukan merupakan nasihat pajak, hukum, atau keuangan profesional</li>
            <li>Tidak dapat dijadikan dasar hukum dalam sengketa pajak atau ketenagakerjaan</li>
            <li>Mungkin memiliki selisih dengan perhitungan resmi akibat variasi peraturan</li>
          </ul>
          <p className="text-muted-foreground font-medium mb-2">Untuk kepastian hukum, selalu konsultasikan dengan:</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Konsultan pajak berlisensi (untuk PPh21/BPJS)</li>
            <li>KJPP berlisensi (untuk penilaian properti)</li>
            <li>Pengacara ketenagakerjaan (untuk sengketa UMK/gaji)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Akurasi Data</h2>
          <p className="text-muted-foreground">Data benchmark cekwajar.id berasal dari:</p>
          <ul className="text-muted-foreground list-disc pl-5 space-y-1 text-sm">
            <li>Data resmi pemerintah (BPS, Kemnaker, BPN) — akurat namun mungkin tidak ter-update secara real-time</li>
            <li>Data pasar yang dikumpulkan dari sumber publik — akurasi 70–85%</li>
            <li>Kontribusi pengguna — terverifikasi namun tidak diaudit secara profesional</li>
          </ul>
          <p className="text-muted-foreground text-sm">
            Kami tidak menjamin akurasi 100% dari semua data yang ditampilkan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Larangan Penggunaan</h2>
          <p className="text-muted-foreground">Anda dilarang:</p>
          <ul className="text-muted-foreground list-disc pl-5 space-y-1 text-sm">
            <li>Menggunakan layanan untuk tujuan melanggar hukum</li>
            <li>Menyalahgunakan atau mengganggu sistem cekwajar.id</li>
            <li>Mengumpulkan data dari cekwajar.id secara otomatis (scraping)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Hak Kekayaan Intelektual</h2>
          <p className="text-muted-foreground text-sm">
            Konten, desain, dan kode cekwajar.id dilindungi hak cipta. Data benchmark
            yang kami sediakan boleh digunakan untuk keperluan pribadi, tidak untuk redistribusi komersial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Batasan Tanggung Jawab</h2>
          <p className="text-muted-foreground text-sm">
            Sejauh diizinkan oleh hukum yang berlaku, cekwajar.id tidak bertanggung jawab atas
            kerugian yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan ini.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Hukum yang Berlaku</h2>
          <p className="text-muted-foreground">
            Syarat ini diatur oleh hukum Republik Indonesia.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Perubahan Layanan</h2>
          <p className="text-muted-foreground text-sm">
            Kami berhak mengubah atau menghentikan layanan kapan saja dengan pemberitahuan
            yang wajar kepada pengguna terdaftar.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Hubungi Kami</h2>
          <p className="text-muted-foreground text-sm">
            Pertanyaan: <a href="mailto:hello@cekwajar.id" className="text-primary hover:underline">hello@cekwajar.id</a>
          </p>
        </section>
      </div>
    </div>
  );
}
