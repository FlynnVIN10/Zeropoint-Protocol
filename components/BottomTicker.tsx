import { useEffect, useState } from 'react';

export default function BottomTicker() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/alerts');
    eventSource.onmessage = (event) => {
      setAlerts(prev => [...prev, event.data].slice(-10));
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap bg-purple text-off-white p-2 fixed bottom-0 w-full">
      {alerts.join(' | ')}
    </div>
  );
}
