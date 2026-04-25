import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TrustBadges } from "@/components/TrustBadges";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — cekwajar.id",
  description:
    "Kebijakan privasi cekwajar.id sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        icon={Shield}
        title="Kebijakan Privasi"
        description="Terakhir diperbarui: 1 Maret 2026"
      />
      <TrustBadges />

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Informasi yang Kami Kumpulkan</h2>
          <p className="text-muted-foreground">
            cekwajar.id mengumpulkan data berikut sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi:
          </p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Data yang Anda berikan:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Alamat email (jika membuat akun)</li>
              <li>Data gaji dan potongan yang Anda masukkan untuk analisis</li>
              <li>File slip gaji yang diunggah (jika menggunakan fitur OCR)</li>
            </ul>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Data yang dikumpulkan otomatis:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Data penggunaan teknis (halaman yang dikunjungi, browser, perangkat)</li>
              <li>Alamat IP (dihash/disamarkan, tidak disimpan dalam bentuk mentah)</li>
            </ul>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Data yang TIDAK kami kumpulkan:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Nomor KTP, paspor, atau dokumen identitas</li>
              <li>Informasi rekening bank atau kartu kredit</li>
              <li>Data kesehatan atau biometrik</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Penggunaan Data</h2>
          <p className="text-muted-foreground">
            Kami menggunakan data Anda untuk:
          </p>
          <ul className="text-muted-foreground list-disc pl-5 space-y-1 text-sm">
            <li>Memberikan hasil analisis yang Anda minta</li>
            <li>Meningkatkan akurasi benchmarks (data dianonimkan dan diagregasi)</li>
            <li>Mengirimkan pembaruan layanan (jika Anda memberi consent)</li>
          </ul>
          <p className="text-muted-foreground">
            Kami <strong>TIDAK</strong> menjual data pribadi Anda kepada pihak ketiga.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Penyimpanan Data</h2>
          <ul className="text-muted-foreground list-disc pl-5 space-y-2 text-sm">
            <li><strong>File slip gaji:</strong> Dihapus otomatis setelah 30 hari</li>
            <li><strong>Data gaji yang diinput:</strong> Disimpan dalam bentuk teranonimkan untuk keperluan benchmark</li>
            <li><strong>Data akun:</strong> Disimpan selama akun aktif</li>
            <li><strong>Server:</strong> Berlokasi di Singapura (Supabase ap-southeast-1)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Hak Anda (UU PDP Pasal 5–8)</h2>
          <p className="text-muted-foreground">Anda berhak untuk:</p>
          <ul className="text-muted-foreground list-disc pl-5 space-y-1 text-sm">
            <li><strong>Mengakses</strong> data pribadi Anda</li>
            <li><strong>Memperbaiki</strong> data yang tidak akurat</li>
            <li><strong>Menghapus</strong> data Anda (right to erasure)</li>
            <li><strong>Menarik persetujuan</strong> kapan saja</li>
          </ul>
          <p className="text-muted-foreground text-sm">
            Untuk menggunakan hak ini, hubungi: <a href="mailto:privacy@cekwajar.id" className="text-primary hover:underline">privacy@cekwajar.id</a>
          </p>
        </section>

        <section id="cookie" className="space-y-3">
          <h2 className="text-xl font-semibold">5. Cookie</h2>
          <p className="text-muted-foreground text-sm">
            Kami menggunakan cookie esensial untuk fungsionalitas dasar (autentikasi, preferensi).
            Kami tidak menggunakan cookie pelacakan pihak ketiga.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Perubahan Kebijakan</h2>
          <p className="text-muted-foreground text-sm">
            Perubahan material pada kebijakan ini akan diberitahukan melalui email atau notifikasi di aplikasi minimal 14 hari sebelumnya.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Hubungi Kami</h2>
          <p className="text-muted-foreground text-sm">
            Pertanyaan tentang privasi: <a href="mailto:privacy@cekwajar.id" className="text-primary hover:underline">privacy@cekwajar.id</a>
          </p>
        </section>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-6">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Catatan:</strong> cekwajar.id bukan konsultan pajak berlisensi (PKP).
            Semua hasil analisis bersifat informasional dan bukan nasihat pajak resmi.
          </p>
        </div>
      </div>
    </div>
  );
}
