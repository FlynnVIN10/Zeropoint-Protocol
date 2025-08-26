import { useState } from 'react';

export default function PromptPane() {
  const [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState([]);

  const handleSubmit = async () => {
    // Send prompt to /api/consensus/proposals
    // Stream response via SSE
    setChat(prev => [...prev, { user: prompt, response: 'Streaming...' }]);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow overflow-y-auto">
        {chat.map((msg, i) => (
          <div key={i}>
            <p><strong>User:</strong> {msg.user}</p>
            <p><strong>Response:</strong> {msg.response}</p>
          </div>
        ))}
      </div>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
