import { useState } from 'react';

export default function ChainOfThought() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle CoT</button>
      {isVisible && (
        <div>
          Route Trace: Provider selected based on latency.
          Rationale: Optimal for query type.
        </div>
      )}
    </div>
  );
}
