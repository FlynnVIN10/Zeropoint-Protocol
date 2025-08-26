import { useState } from 'react';

export default function LeftPanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-matte-black p-4 ${isOpen ? 'w-64' : 'w-16'}`}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && (
        <>
          <section>Synthiant Consensus</section>
          <section>Proposals</section>
          <section>Metrics</section>
          <section>Health</section>
        </>
      )}
    </div>
  );
}
