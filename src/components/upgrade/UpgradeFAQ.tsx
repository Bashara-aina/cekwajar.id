import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'Apakah data slip saya benar-benar aman?',
    answer: 'Slip dienkripsi at-rest di Supabase Singapore (ap-southeast-1), pemrosesan otomatis (tidak ada manusia yang lihat), dihapus permanen 30 hari sesuai UU PDP Pasal 28.',
  },
  {
    question: 'Bagaimana kalau perhitungan kalian salah?',
    answer: 'Mesin kalkulasi diaudit konsultan pajak bersertifikasi PKP sebelum launch, plus tes otomatis tiap malam terhadap 15 kasus standar. Kalau menemukan error, kamu dapat 3 bulan gratis dan kami publikasi koreksi dalam 48 jam.',
  },
  {
    question: 'Bisa batalkan kapan saja?',
    answer: 'Ya. Klik "Cancel langganan" di dashboard. Akses Pro tetap aktif sampai akhir periode billing yang sudah dibayar.',
  },
  {
    question: 'Apa yang dipakai untuk refund 7 hari?',
    answer: 'Refund otomatis via Midtrans, kembali ke metode pembayaran asal dalam 1×24 jam. Tanpa pertanyaan.',
  },
  {
    question: 'Apakah ini tools tax filing? (SPT, e-Filing)?',
    answer: 'Bukan. cekwajar.id adalah tool audit slip gaji. Kami tidak filing pajak kamu, tidak mengakses akun DJP kamu, tidak menggantikan Konsultan pajak resmi.',
  },
  {
    question: 'Saya pegawai negeri / freelancer. Apakah bisa pakai?',
    answer: 'Untuk launch (Mei 2026), Wajar Slip dioptimalkan untuk slip gaji bulanan reguler dari perusahaan swasta. ASN dan freelance akan ada Q3 2026. Kalau kamu tidak yakin slip kamu didukung, audit gratis dulu — kalau gagal, kamu tidak bayar.',
  },
]

export function UpgradeFAQ() {
  return (
    <section className="border-t border-slate-100 bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Pertanyaan umum
        </h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((faq, i) => (
            <details key={i} className="group rounded-lg border border-slate-200">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-slate-900">
                {faq.question}
                <span className="ml-2 shrink-0 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="border-t border-slate-100 p-4 text-sm text-slate-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          <Link href="/privacy-policy" className="hover:underline">Kebijakan Privasi</Link>
          {' '}·{' '}
          <Link href="/terms" className="hover:underline">Syarat & Ketentuan</Link>
          {' '}·{' '}
          <Link href="/regulasi/pmk-168-2023" className="hover:underline">Regulasi</Link>
        </p>
      </div>
    </section>
  )
}
