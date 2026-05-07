export function UpgradeTestimonials() {
  return (
    <section className="border-t border-slate-100 bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Cerita dari pengguna kami
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Kami sedang mengumpulkan kisah pengguna pertama.
          <br />Mau jadi salah satunya?
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm italic text-slate-500">
            "Kami sedang mengumpulkan kisah pengguna pertama. Mau jadi salah satunya? Audit gratis sekarang →"
          </p>
          <a
            href="/wajar-slip"
            className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Audit slip gratis →
          </a>
        </div>
      </div>
    </section>
  )
}