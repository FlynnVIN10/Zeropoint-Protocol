import { useEffect, useState } from 'react';

export default function TopTicker() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/synthiant');
    eventSource.onmessage = (event) => {
      setMessages(prev => [...prev.slice(-9), event.data]);
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap accent-purple p-2">
      {messages.join(' | ')}
    </div>
  );
}
