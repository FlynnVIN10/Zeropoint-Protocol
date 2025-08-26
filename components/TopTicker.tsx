import { useEffect, useState } from 'react';

export default function TopTicker() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/events/synthiant');
    eventSource.onmessage = (event) => {
      setMessages(prev => [...prev, event.data].slice(-10));
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="overflow-hidden whitespace-nowrap bg-purple text-off-white p-2">
      {messages.join(' | ')}
    </div>
  );
}
