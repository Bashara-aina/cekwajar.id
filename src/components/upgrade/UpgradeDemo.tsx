import Image from 'next/image'

export function UpgradeDemo() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Begini hasil yang kamu dapat
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Setiap pelanggaran dicatat dengan detail rupiah dan langkah yang harus kamu lakukan.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative h-64 w-full sm:h-80">
            <Image
              src="/demo-verdict-mockup.png"
              alt="Demo hasil audit Pro"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  )
}
