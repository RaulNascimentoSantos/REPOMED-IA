import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
      isOnline 
        ? 'text-green-600 bg-green-50' 
        : 'text-red-600 bg-red-50 animate-pulse'
    }`}>
      {isOnline ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="font-medium">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};