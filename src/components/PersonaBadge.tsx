import React from 'react';
import styles from './PersonaBadge.module.css';

export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  intent: 'inform' | 'question' | 'action' | 'consensus';
  confidence?: number;
  metadata?: {
    trustScore?: number;
    ethicalScore?: number;
    expertise?: string[];
  };
}

interface PersonaBadgeProps {
  persona: Persona;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onClick?: (persona: Persona) => void;
  className?: string;
}

export const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  persona,
  size = 'medium',
  showDetails = false,
  onClick,
  className = '',
}) => {
  const handleClick = () => {
    // Telemetry logging for persona badge interaction
    if (typeof window !== 'undefined') {
      fetch('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'persona_badge_click',
          timestamp: Date.now(),
          data: {
            personaId: persona.id,
            personaRole: persona.role,
            personaIntent: persona.intent,
            size,
            showDetails,
          },
        }),
      }).catch(console.error);
    }

    onClick?.(persona);
  };

  const getIntentColor = (intent: Persona['intent']) => {
    switch (intent) {
      case 'inform':
        return styles.intentInform;
      case 'question':
        return styles.intentQuestion;
      case 'action':
        return styles.intentAction;
      case 'consensus':
        return styles.intentConsensus;
      default:
        return styles.intentDefault;
    }
  };

  const getIntentIcon = (intent: Persona['intent']) => {
    switch (intent) {
      case 'inform':
        return '📢';
      case 'question':
        return '❓';
      case 'action':
        return '⚡';
      case 'consensus':
        return '🤝';
      default:
        return '👤';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  return (
    <div
      className={`${styles.personaBadge} ${getSizeClass()} ${getIntentColor(persona.intent)} ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : 'img'}
      aria-label={`${persona.name}, ${persona.role} - ${persona.intent} intent`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.avatarContainer}>
        <img
          src={persona.avatar}
          alt={`${persona.name} avatar`}
          className={styles.avatar}
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/img/default-avatar.png';
          }}
        />
        <span className={styles.intentIcon} aria-hidden="true">
          {getIntentIcon(persona.intent)}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.name}>{persona.name}</div>
        <div className={styles.role}>{persona.role}</div>
        
        {showDetails && persona.metadata && (
          <div className={styles.metadata}>
            {persona.metadata.trustScore !== undefined && (
              <div className={styles.score}>
                <span className={styles.scoreLabel}>Trust:</span>
                <span className={styles.scoreValue}>{persona.metadata.trustScore}%</span>
              </div>
            )}
            {persona.metadata.ethicalScore !== undefined && (
              <div className={styles.score}>
                <span className={styles.scoreLabel}>Ethical:</span>
                <span className={styles.scoreValue}>{persona.metadata.ethicalScore}%</span>
              </div>
            )}
            {persona.confidence !== undefined && (
              <div className={styles.confidence}>
                <span className={styles.confidenceLabel}>Confidence:</span>
                <span className={styles.confidenceValue}>{persona.confidence}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {onClick && (
        <div className={styles.interactionIndicator} aria-hidden="true">
          <span className={styles.clickHint}>Click for details</span>
        </div>
      )}
    </div>
  );
};

export default PersonaBadge; 