export function UpgradeRefundExplain() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Cara refund (lebih mudah daripada cancel Netflix)
        </h2>
        <div className="mt-6 space-y-3">
          {[
            'Login → dashboard.',
            'Klik tombol "Refund (7 hari)" di kanan atas.',
            'Konfirmasi alasan (opsional).',
            'Uang balik 1×24 jam, otomatis.',
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700">{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            Tidak ada form panjang. Tidak ada chat dengan customer service.
            <br />Tidak ada pertanyaan "kenapa kamu mau refund?".
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            Kalau pengalaman kamu sehari setelah bayar tidak senilai IDR 49.000, kembalikan.
            <br />Kami tidak akan tanya kenapa.
          </p>
        </div>
      </div>
    </section>
  )
}