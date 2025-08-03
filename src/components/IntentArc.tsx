import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './IntentArc.module.css';

export interface IntentData {
  id: string;
  type: 'inform' | 'question' | 'action' | 'consensus' | 'clarification' | 'exploration';
  confidence: number;
  progress: number; // 0-100
  metadata?: {
    entities?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    urgency?: 'low' | 'medium' | 'high';
    complexity?: 'simple' | 'moderate' | 'complex';
  };
  timestamp: number;
}

export interface ChatMetadata {
  messageId: string;
  intent: string;
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: number;
}

interface IntentArcProps {
  intentData: IntentData[];
  chatMetadata?: ChatMetadata[];
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  showLabels?: boolean;
  animate?: boolean;
  onIntentClick?: (intent: IntentData) => void;
  className?: string;
}

export const IntentArc: React.FC<IntentArcProps> = ({
  intentData,
  chatMetadata = [],
  size = 'medium',
  showProgress = true,
  showLabels = true,
  animate = true,
  onIntentClick,
  className = '',
}) => {
  const [hoveredIntent, setHoveredIntent] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number>();

  // Calculate arc dimensions based on size
  const getArcDimensions = () => {
    switch (size) {
      case 'small':
        return { radius: 40, strokeWidth: 4, fontSize: 10 };
      case 'large':
        return { radius: 80, strokeWidth: 8, fontSize: 14 };
      default:
        return { radius: 60, strokeWidth: 6, fontSize: 12 };
    }
  };

  const { radius, strokeWidth, fontSize } = getArcDimensions();
  const centerX = radius + strokeWidth;
  const centerY = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Get intent color
  const getIntentColor = (type: IntentData['type']) => {
    switch (type) {
      case 'inform':
        return '#00C4FF';
      case 'question':
        return '#FFD700';
      case 'action':
        return '#FF6B6B';
      case 'consensus':
        return '#4ECDC4';
      case 'clarification':
        return '#A78BFA';
      case 'exploration':
        return '#FF8C42';
      default:
        return '#888888';
    }
  };

  // Get intent icon
  const getIntentIcon = (type: IntentData['type']) => {
    switch (type) {
      case 'inform':
        return '📢';
      case 'question':
        return '❓';
      case 'action':
        return '⚡';
      case 'consensus':
        return '🤝';
      case 'clarification':
        return '💡';
      case 'exploration':
        return '🔍';
      default:
        return '💬';
    }
  };

  // Calculate arc path for each intent
  const calculateArcPath = (startAngle: number, endAngle: number) => {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Calculate positions for intent segments
  const calculateIntentSegments = () => {
    const totalProgress = intentData.reduce((sum, intent) => sum + intent.progress, 0);
    const segments: Array<{
      intent: IntentData;
      startAngle: number;
      endAngle: number;
      path: string;
      progressPath: string;
      labelPosition: { x: number; y: number };
    }> = [];

    let currentAngle = -Math.PI / 2; // Start from top

    intentData.forEach((intent) => {
      const angleSpan = (intent.progress / totalProgress) * Math.PI * 1.8; // Use 90% of circle
      const endAngle = currentAngle + angleSpan;
      
      const path = calculateArcPath(currentAngle, endAngle);
      const progressAngle = currentAngle + (angleSpan * intent.confidence);
      const progressPath = calculateArcPath(currentAngle, progressAngle);
      
      // Calculate label position
      const labelAngle = currentAngle + angleSpan / 2;
      const labelRadius = radius + 20;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);

      segments.push({
        intent,
        startAngle: currentAngle,
        endAngle,
        path,
        progressPath,
        labelPosition: { x: labelX, y: labelY },
      });

      currentAngle = endAngle;
    });

    return segments;
  };

  // Animate progress
  useEffect(() => {
    if (!animate) {
      setAnimationProgress(1);
      return;
    }

    const animateProgress = () => {
      setAnimationProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          return 1;
        }
        animationRef.current = requestAnimationFrame(animateProgress);
        return next;
      });
    };

    setAnimationProgress(0);
    animationRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, intentData]);

  // Handle intent click
  const handleIntentClick = useCallback((intent: IntentData) => {
    onIntentClick?.(intent);
    
    // Log telemetry
    if (typeof window !== 'undefined') {
      fetch('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'intent_arc_click',
          timestamp: Date.now(),
          data: {
            intentId: intent.id,
            intentType: intent.type,
            confidence: intent.confidence,
            progress: intent.progress,
          },
        }),
      }).catch(console.error);
    }
  }, [onIntentClick]);

  const segments = calculateIntentSegments();
  const totalWidth = centerX * 2;
  const totalHeight = centerY * 2;

  if (intentData.length === 0) {
    return (
      <div className={`${styles.intentArc} ${styles.empty} ${className}`}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📊</span>
          <p>No intent data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.intentArc} ${className}`} data-size={size}>
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className={styles.svg}
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          className={styles.backgroundCircle}
        />

        {/* Intent segments */}
        {segments.map((segment, index) => {
          const isHovered = hoveredIntent === segment.intent.id;
          const intentColor = getIntentColor(segment.intent.type);
          const animatedProgress = animate ? animationProgress : 1;
          
          return (
            <g key={segment.intent.id} className={styles.segmentGroup}>
              {/* Background segment */}
              <path
                d={segment.path}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className={styles.segmentBackground}
              />
              
              {/* Progress segment */}
              <path
                d={segment.progressPath}
                fill="none"
                stroke={intentColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className={`${styles.segmentProgress} ${animate ? styles.animated : ''}`}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: circumference * (1 - segment.intent.confidence * animatedProgress),
                  opacity: isHovered ? 1 : 0.8,
                }}
                onClick={() => handleIntentClick(segment.intent)}
                onMouseEnter={() => setHoveredIntent(segment.intent.id)}
                onMouseLeave={() => setHoveredIntent(null)}
                role="button"
                tabIndex={0}
                aria-label={`${segment.intent.type} intent - ${Math.round(segment.intent.confidence * 100)}% confidence`}
              />

              {/* Intent icon */}
              <text
                x={segment.labelPosition.x}
                y={segment.labelPosition.y}
                fontSize={fontSize}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`${styles.intentIcon} ${isHovered ? styles.hovered : ''}`}
                style={{ opacity: showLabels ? 1 : 0 }}
              >
                {getIntentIcon(segment.intent.type)}
              </text>

              {/* Progress indicator */}
              {showProgress && (
                <text
                  x={segment.labelPosition.x}
                  y={segment.labelPosition.y + fontSize + 4}
                  fontSize={fontSize - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.progressText}
                  style={{ opacity: showLabels ? 1 : 0 }}
                >
                  {Math.round(segment.intent.progress)}%
                </text>
              )}
            </g>
          );
        })}

        {/* Center content */}
        <g className={styles.centerContent}>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.3}
            fill="rgba(26, 26, 26, 0.9)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={1}
            className={styles.centerCircle}
          />
          
          <text
            x={centerX}
            y={centerY - 4}
            fontSize={fontSize}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.centerText}
          >
            {intentData.length}
          </text>
          
          <text
            x={centerX}
            y={centerY + fontSize}
            fontSize={fontSize - 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.centerSubtext}
          >
            Intents
          </text>
        </g>
      </svg>

      {/* Legend */}
      {showLabels && (
        <div className={styles.legend}>
          {intentData.map((intent) => (
            <div
              key={intent.id}
              className={`${styles.legendItem} ${hoveredIntent === intent.id ? styles.hovered : ''}`}
              onMouseEnter={() => setHoveredIntent(intent.id)}
              onMouseLeave={() => setHoveredIntent(null)}
              onClick={() => handleIntentClick(intent)}
              role="button"
              tabIndex={0}
            >
              <div
                className={styles.legendColor}
                style={{ backgroundColor: getIntentColor(intent.type) }}
              />
              <span className={styles.legendText}>
                {intent.type.charAt(0).toUpperCase() + intent.type.slice(1)}
              </span>
              <span className={styles.legendProgress}>
                {Math.round(intent.progress)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hoveredIntent && (
        <div className={styles.tooltip}>
          {(() => {
            const intent = intentData.find(i => i.id === hoveredIntent);
            if (!intent) return null;
            
            return (
              <>
                <div className={styles.tooltipHeader}>
                  <span className={styles.tooltipIcon}>
                    {getIntentIcon(intent.type)}
                  </span>
                  <span className={styles.tooltipTitle}>
                    {intent.type.charAt(0).toUpperCase() + intent.type.slice(1)} Intent
                  </span>
                </div>
                <div className={styles.tooltipContent}>
                  <div className={styles.tooltipRow}>
                    <span>Confidence:</span>
                    <span>{Math.round(intent.confidence * 100)}%</span>
                  </div>
                  <div className={styles.tooltipRow}>
                    <span>Progress:</span>
                    <span>{Math.round(intent.progress)}%</span>
                  </div>
                  {intent.metadata?.sentiment && (
                    <div className={styles.tooltipRow}>
                      <span>Sentiment:</span>
                      <span>{intent.metadata.sentiment}</span>
                    </div>
                  )}
                  {intent.metadata?.urgency && (
                    <div className={styles.tooltipRow}>
                      <span>Urgency:</span>
                      <span>{intent.metadata.urgency}</span>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default IntentArc; 