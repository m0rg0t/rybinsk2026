import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(() => !navigator.onLine);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const handleOnline = () => {
      clearTimeout(hideTimer);
      setIsOnline(true);
      setShowIndicator(true);
      hideTimer = setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      clearTimeout(hideTimer);
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 font-mono text-xs"
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Подключение восстановлено</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Работает offline</span>
          </>
        )}
      </Badge>
    </div>
  );
}