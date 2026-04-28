export function UpgradeRefundExplain() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Cara refund (lebih mudah dari cancel Netflix)
        </h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
            <p className="text-slate-700">Login → dashboard.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
            <p className="text-slate-700">Klik tombol &ldquo;Refund (7 hari)&rdquo; di kanan atas.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</span>
            <p className="text-slate-700">Konfirmasi alasan (opsional).</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">4</span>
            <p className="text-slate-700">Uang balik 1×24 jam, otomatis.</p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Tidak ada form panjang. Tidak ada chat dengan customer service. Tidak ada pertanyaan &ldquo;kenapa kamu mau refund&rdquo;?<br />
          Kalau pengalaman kamu sehari setelah bayar tidak senilai IDR 49.000, kembalikan. Kami tidak akan tanya kenapa.
        </p>
      </div>
    </section>
  )
}
