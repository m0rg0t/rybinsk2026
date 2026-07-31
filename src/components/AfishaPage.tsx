import { ArrowLeft } from 'lucide-react';

interface AfishaPageProps {
  onBack: () => void;
}

const afishaGroups = [
  {
    title: 'Афиши 2026',
    images: [
      { id: '2026-1', src: '/afisha/2026-1.jpg', alt: 'Программа Дня города Рыбинска 2026, 1 августа' },
      { id: '2026-2', src: '/afisha/2026-2.jpg', alt: 'Променад по Бульварной — программа 1 августа 2026' },
    ],
  },
  {
    title: 'Архив 2025',
    images: [1, 2, 3, 4, 5, 6, 7].map(n => ({
      id: `2025-${n}`,
      src: `/afisha/${n}.jpg`,
      alt: `Афиша Дня города 2025 — ${n}`,
    })),
  },
];

export function AfishaPage({ onBack }: AfishaPageProps) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-3 border-double border-gold bg-paper">
        <div className="container mx-auto flex items-center gap-4 px-4 py-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-gold px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Назад
          </button>
          <h1 className="font-display text-4xl text-ink">Афиши</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-10">
          {afishaGroups.map(group => (
            <section key={group.title} aria-label={group.title}>
              <h2 className="mb-4 rule-hairline pt-3 text-sm font-bold uppercase tracking-[0.15em] text-kinovar">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {group.images.map(image => (
                  <a
                    key={image.id}
                    href={image.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gold-soft bg-paper-card p-2 transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <img src={image.src} alt={image.alt} className="h-auto w-full" loading="lazy" />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
