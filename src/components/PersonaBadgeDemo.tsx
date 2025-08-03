import React, { useState } from 'react';
import PersonaBadge, { Persona } from './PersonaBadge';
import styles from './PersonaBadgeDemo.module.css';

const demoPersonas: Persona[] = [
  {
    id: 'ai-assistant-1',
    name: 'Zeropoint AI',
    role: 'Primary Assistant',
    avatar: '/img/ai-assistant.png',
    intent: 'inform',
    confidence: 95,
    metadata: {
      trustScore: 98,
      ethicalScore: 94,
      expertise: ['AI', 'Machine Learning', 'Consensus Building'],
    },
  },
  {
    id: 'consensus-agent-1',
    name: 'Consensus Agent',
    role: 'Consensus Facilitator',
    avatar: '/img/consensus-agent.png',
    intent: 'consensus',
    confidence: 87,
    metadata: {
      trustScore: 91,
      ethicalScore: 96,
      expertise: ['Consensus', 'Mediation', 'Conflict Resolution'],
    },
  },
  {
    id: 'question-agent-1',
    name: 'Query Agent',
    role: 'Question Handler',
    avatar: '/img/query-agent.png',
    intent: 'question',
    confidence: 82,
    metadata: {
      trustScore: 89,
      ethicalScore: 92,
      expertise: ['Query Processing', 'Information Retrieval'],
    },
  },
  {
    id: 'action-agent-1',
    name: 'Action Agent',
    role: 'Task Executor',
    avatar: '/img/action-agent.png',
    intent: 'action',
    confidence: 90,
    metadata: {
      trustScore: 93,
      ethicalScore: 88,
      expertise: ['Task Execution', 'Automation', 'Workflow Management'],
    },
  },
];

export const PersonaBadgeDemo: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersona(persona);
    // Telemetry logging for demo interaction
    if (typeof window !== 'undefined') {
      fetch('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'persona_demo_click',
          timestamp: Date.now(),
          data: {
            personaId: persona.id,
            personaRole: persona.role,
            personaIntent: persona.intent,
          },
        }),
      }).catch(console.error);
    }
  };

  return (
    <div className={styles.demoContainer}>
      <div className={styles.header}>
        <h2>PersonaBadge Component Demo</h2>
        <p>Interactive demonstration of the PersonaBadge component with various personas and configurations</p>
      </div>

      <div className={styles.controls}>
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
          />
          Show Details
        </label>
      </div>

      <div className={styles.sections}>
        {/* Size Variants */}
        <section className={styles.section}>
          <h3>Size Variants</h3>
          <div className={styles.badgeGrid}>
            {demoPersonas.map((persona) => (
              <div key={`small-${persona.id}`} className={styles.badgeItem}>
                <h4>Small</h4>
                <PersonaBadge
                  persona={persona}
                  size="small"
                  showDetails={showDetails}
                  onClick={handlePersonaClick}
                />
              </div>
            ))}
            {demoPersonas.map((persona) => (
              <div key={`medium-${persona.id}`} className={styles.badgeItem}>
                <h4>Medium</h4>
                <PersonaBadge
                  persona={persona}
                  size="medium"
                  showDetails={showDetails}
                  onClick={handlePersonaClick}
                />
              </div>
            ))}
            {demoPersonas.map((persona) => (
              <div key={`large-${persona.id}`} className={styles.badgeItem}>
                <h4>Large</h4>
                <PersonaBadge
                  persona={persona}
                  size="large"
                  showDetails={showDetails}
                  onClick={handlePersonaClick}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Intent Types */}
        <section className={styles.section}>
          <h3>Intent Types</h3>
          <div className={styles.intentGrid}>
            {demoPersonas.map((persona) => (
              <div key={`intent-${persona.id}`} className={styles.intentItem}>
                <h4>{persona.intent.charAt(0).toUpperCase() + persona.intent.slice(1)}</h4>
                <PersonaBadge
                  persona={persona}
                  showDetails={showDetails}
                  onClick={handlePersonaClick}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section className={styles.section}>
          <h3>Interactive Demo</h3>
          <div className={styles.interactiveDemo}>
            <div className={styles.badgeShowcase}>
              {demoPersonas.map((persona) => (
                <PersonaBadge
                  key={`interactive-${persona.id}`}
                  persona={persona}
                  showDetails={showDetails}
                  onClick={handlePersonaClick}
                  className={styles.interactiveBadge}
                />
              ))}
            </div>
            
            {selectedPersona && (
              <div className={styles.selectionInfo}>
                <h4>Selected Persona</h4>
                <PersonaBadge
                  persona={selectedPersona}
                  size="large"
                  showDetails={true}
                />
                <div className={styles.personaDetails}>
                  <h5>Details</h5>
                  <ul>
                    <li><strong>ID:</strong> {selectedPersona.id}</li>
                    <li><strong>Name:</strong> {selectedPersona.name}</li>
                    <li><strong>Role:</strong> {selectedPersona.role}</li>
                    <li><strong>Intent:</strong> {selectedPersona.intent}</li>
                    <li><strong>Confidence:</strong> {selectedPersona.confidence}%</li>
                    {selectedPersona.metadata?.expertise && (
                      <li>
                        <strong>Expertise:</strong> {selectedPersona.metadata.expertise.join(', ')}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Accessibility Demo */}
        <section className={styles.section}>
          <h3>Accessibility Features</h3>
          <div className={styles.accessibilityDemo}>
            <p>All PersonaBadge components support:</p>
            <ul>
              <li>Keyboard navigation (Tab, Enter, Space)</li>
              <li>Screen reader compatibility</li>
              <li>High contrast mode support</li>
              <li>Reduced motion preferences</li>
              <li>WCAG 2.1 AA compliance</li>
            </ul>
            <div className={styles.accessibilityBadge}>
              <PersonaBadge
                persona={demoPersonas[0]}
                showDetails={true}
                onClick={handlePersonaClick}
              />
              <p className={styles.accessibilityNote}>
                Try using Tab to focus and Enter/Space to interact
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PersonaBadgeDemo; 