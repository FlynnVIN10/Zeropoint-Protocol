import { useEffect, useState } from 'react';

interface ChatItem { user: string; response: string; meta?: any }

export default function PromptPane() {
  const [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const es = new EventSource('/api/events/consensus');
    es.addEventListener('consensus', (e: MessageEvent) => {
      setChat(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], response: e.data };
        return updated;
      });
    });
    return () => es.close();
  }, []);

  const handleSubmit = async () => {
    const current = prompt;
    setChat(prev => [...prev, { user: current, response: 'routing…' }]);
    setPrompt('');
    try {
      await fetch('/consensus/proposals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: current })
      });
    } catch {}
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow overflow-y-auto">
        {chat.map((msg, i) => (
          <div key={i}>
            <p><strong>User:</strong> {msg.user}</p>
            <p><strong>Response:</strong> {msg.response}</p>
            {showAdvanced && msg.meta && (
              <div>
                <small>Route: {msg.meta.route?.provider} • latency {msg.meta.latencyMs}ms</small>
                {Array.isArray(msg.meta.route?.probes) && (
                  <div><small>Probes: {msg.meta.route.probes.map((p: any) => `${p.name}:${p.latency}ms`).join(', ')}</small></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8}}>
        <input value={prompt} onChange={e => setPrompt(e.target.value)} />
        <button onClick={handleSubmit}>Send</button>
        <button onClick={() => setShowAdvanced(!showAdvanced)}>{showAdvanced ? 'Hide' : 'Show'} route</button>
      </div>
    </div>
  );
}
