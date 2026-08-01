import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { EventList } from '@/components/EventList';
import { AfishaPage } from '@/components/AfishaPage';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import eventData2026 from '@/data/events.json';
import eventData2025 from '@/data/events2025.json';
import { EventData } from '@/types';

type View = 'events' | 'archive' | 'afisha';

function countEvents(data: EventData): number {
  return data.locations.reduce((total, location) => total + location.events.length, 0);
}

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('rybinsk-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('rybinsk-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(v => !v) };
}

function App() {
  const [currentView, setCurrentView] = useState<View>('events');
  const { isDark, toggleTheme } = useTheme();

  if (currentView === 'afisha') {
    return <AfishaPage onBack={() => setCurrentView('events')} />;
  }

  const isArchive = currentView === 'archive';
  const eventData = (isArchive ? eventData2025 : eventData2026) as EventData;

  return (
    <div className="min-h-screen bg-paper">
      <OfflineIndicator />

      {/* Мачтхед — по мотивам гравированной шапки афиши */}
      <header className="border-b-3 border-double border-gold bg-paper">
        <div className="container mx-auto px-4 pt-8 pb-6 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-ink-muted uppercase">
            1071 — 2026 · городу 955 лет
          </p>
          <h1 className="font-display text-6xl md:text-8xl leading-none text-ink mt-2">
            Рыбинскъ
          </h1>
          <p className="font-display text-2xl md:text-3xl text-kinovar mt-1">
            {isArchive ? 'День города · архив 2025' : 'город единства'}
          </p>

          <div className="mx-auto mt-4 flex max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-gold-soft" aria-hidden="true" />
            <svg
              className="h-3 w-10 text-gold"
              viewBox="0 0 60 16"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* осётр с герба Рыбинска */}
              <path d="M2 8c6-4 14-6 24-6 9 0 17 1 24 4l8-4-2 6 2 6-8-4c-7 3-15 4-24 4C16 14 8 12 2 8Zm24-4 3 4-3 4-3-4 3-4Zm10 0 3 4-3 4-3-4 3-4Z" />
            </svg>
            <span className="h-px flex-1 bg-gold-soft" aria-hidden="true" />
          </div>

          <p className="mt-4 font-mono text-sm text-ink">
            {isArchive ? '2 августа 2025' : '1 августа 2026, суббота'} · центр города
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {eventData.locations.length} площадок · {countEvents(eventData)} событий · 0+
          </p>

          <nav className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('afisha')}
              className="border border-gold bg-transparent px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Афиши
            </button>
            <button
              onClick={() => setCurrentView(isArchive ? 'events' : 'archive')}
              className="border border-gold-soft bg-transparent px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {isArchive ? '← Программа 2026' : 'Архив 2025'}
            </button>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
              title={isDark ? 'Светлая тема' : 'Тёмная тема'}
              className="border border-gold-soft p-2 text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <EventList key={eventData.date} eventData={eventData} />
        </div>
      </main>

      <footer className="mt-16 border-t-3 border-double border-gold bg-ink text-paper">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="font-display text-2xl">Рыбинскъ</p>
          <p className="mt-2 font-mono text-xs tracking-[0.3em] uppercase text-gold-soft">
            Золотое кольцо России
          </p>
          <p className="mt-4 text-sm text-paper/70">
            Мероприятия проводятся при поддержке администрации города.
            Время может изменяться — следите за обновлениями.
          </p>
          <p className="mt-2 text-xs text-paper/50">
            Генеральный партнёр — ПСБ · © 2026 День города Рыбинска
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
