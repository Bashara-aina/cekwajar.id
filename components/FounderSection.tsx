import { Heart } from 'lucide-react';

interface FounderSectionProps {
  name?: string;
  role?: string;
  bio?: string;
}

export function FounderSection({
  name = 'Bashara',
  role = 'Founder, cekwajar.id',
  bio,
}: FounderSectionProps) {
  const defaultBio = `"Saya bikin cekwajar.id karena pernah kena underpay BPJS hampir setahun penuh sebelum sadar. Waktu itu saya nggak tahu harus cek ke mana, dan nggak ada tools yang mudah. Sekarang kamu nggak perlu ngalamin hal yang sama."`;

  return (
    <section className="py-16 px-4 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-900">
        <div className="flex items-center gap-3 mb-5">
          {/* Founder avatar placeholder — replace with actual photo if available */}
          <div className="w-14 h-14 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-2xl font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>

        <blockquote className="text-foreground leading-relaxed mb-4">
          {bio || defaultBio}
        </blockquote>

        <div className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
          <Heart className="w-4 h-4" />
          <span>Dibuat dengan penuh untuk karyawan Indonesia</span>
        </div>
      </div>
    </section>
  );
}