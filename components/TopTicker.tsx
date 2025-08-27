import { useEffect, useState } from 'react';

export default function TopTicker() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/consensus');
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const text = `[consensus] ${data.state} #${data.seq} ${data.ts}`;
        setMessages(prev => [...prev.slice(-9), text]);
      } catch {
        setMessages(prev => [...prev.slice(-9), event.data]);
      }
    };
    eventSource.addEventListener('consensus', handler as any);
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap accent-purple p-2">
      {messages.join(' | ')}
    </div>
  );
}
