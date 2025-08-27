import { useEffect, useState } from 'react';

export default function BottomTicker() {
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/synthiant');
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const text = `[synthiant] ${data.msg} #${data.seq} ${data.ts}`;
        setAlerts(prev => [...prev.slice(-9), text]);
      } catch {
        setAlerts(prev => [...prev.slice(-9), event.data]);
      }
    };
    eventSource.addEventListener('tick', handler as any);
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap accent-purple p-2 fixed bottom-0 w-full">
      {alerts.join(' | ')}
    </div>
  );
}
