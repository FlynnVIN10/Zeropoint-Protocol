import { useEffect, useState } from 'react';

export default function BottomTicker() {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/alerts');
    eventSource.onmessage = (event) => {
      setAlerts(prev => [...prev.slice(-9), event.data]);
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap accent-purple p-2 fixed bottom-0 w-full">
      {alerts.join(' | ')}
    </div>
  );
}
