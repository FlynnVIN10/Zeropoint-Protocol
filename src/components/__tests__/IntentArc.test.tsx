import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntentArc, { IntentData, ChatMetadata } from '../IntentArc';

// Mock fetch for telemetry
global.fetch = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

const mockIntentData: IntentData[] = [
  {
    id: 'intent-1',
    type: 'inform',
    confidence: 0.85,
    progress: 30,
    metadata: {
      entities: ['Zeropoint Protocol'],
      sentiment: 'positive',
      urgency: 'low',
      complexity: 'simple',
    },
    timestamp: Date.now(),
  },
  {
    id: 'intent-2',
    type: 'question',
    confidence: 0.72,
    progress: 25,
    metadata: {
      entities: ['consensus', 'system'],
      sentiment: 'neutral',
      urgency: 'medium',
      complexity: 'moderate',
    },
    timestamp: Date.now(),
  },
  {
    id: 'intent-3',
    type: 'action',
    confidence: 0.93,
    progress: 45,
    metadata: {
      entities: ['code', 'examples'],
      sentiment: 'positive',
      urgency: 'high',
      complexity: 'complex',
    },
    timestamp: Date.now(),
  },
];

const mockChatMetadata: ChatMetadata[] = [
  {
    messageId: 'msg-1',
    intent: 'inform',
    entities: ['Zeropoint Protocol'],
    sentiment: 'positive',
    confidence: 0.85,
    timestamp: Date.now(),
  },
  {
    messageId: 'msg-2',
    intent: 'question',
    entities: ['consensus'],
    sentiment: 'neutral',
    confidence: 0.72,
    timestamp: Date.now(),
  },
];

describe('IntentArc Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders without crashing', () => {
    render(<IntentArc intentData={mockIntentData} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG
  });

  it('renders empty state when no intent data', () => {
    render(<IntentArc intentData={[]} />);
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('No intent data available')).toBeInTheDocument();
  });

  it('displays correct number of intents in center', () => {
    render(<IntentArc intentData={mockIntentData} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Intents')).toBeInTheDocument();
  });

  it('renders legend items correctly', () => {
    render(<IntentArc intentData={mockIntentData} showLabels={true} />);
    
    expect(screen.getByText('Inform')).toBeInTheDocument();
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('does not render legend when showLabels is false', () => {
    render(<IntentArc intentData={mockIntentData} showLabels={false} />);
    
    expect(screen.queryByText('Inform')).not.toBeInTheDocument();
    expect(screen.queryByText('Question')).not.toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('calls onIntentClick when legend item is clicked', () => {
    const handleIntentClick = jest.fn();
    render(
      <IntentArc 
        intentData={mockIntentData} 
        onIntentClick={handleIntentClick}
        showLabels={true}
      />
    );

    const informLegendItem = screen.getByText('Inform').closest('div');
    fireEvent.click(informLegendItem!);

    expect(handleIntentClick).toHaveBeenCalledWith(mockIntentData[0]);
  });

  it('sends telemetry when intent is clicked', async () => {
    const handleIntentClick = jest.fn();
    render(
      <IntentArc 
        intentData={mockIntentData} 
        onIntentClick={handleIntentClick}
        showLabels={true}
      />
    );

    const informLegendItem = screen.getByText('Inform').closest('div');
    fireEvent.click(informLegendItem!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/v1/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ux_interaction',
          type: 'intent_arc_click',
          timestamp: expect.any(Number),
          data: {
            intentId: 'intent-1',
            intentType: 'inform',
            confidence: 0.85,
            progress: 30,
          },
        }),
      });
    });
  });

  it('handles keyboard navigation', () => {
    const handleIntentClick = jest.fn();
    render(
      <IntentArc 
        intentData={mockIntentData} 
        onIntentClick={handleIntentClick}
        showLabels={true}
      />
    );

    const informLegendItem = screen.getByText('Inform').closest('div');
    fireEvent.keyDown(informLegendItem!, { key: 'Enter' });

    expect(handleIntentClick).toHaveBeenCalledWith(mockIntentData[0]);
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(
      <IntentArc intentData={mockIntentData} size="small" />
    );

    let intentArc = container.firstChild as HTMLElement;
    expect(intentArc).toHaveAttribute('data-size', 'small');

    rerender(<IntentArc intentData={mockIntentData} size="large" />);
    intentArc = container.firstChild as HTMLElement;
    expect(intentArc).toHaveAttribute('data-size', 'large');

    rerender(<IntentArc intentData={mockIntentData} size="medium" />);
    intentArc = container.firstChild as HTMLElement;
    expect(intentArc).toHaveAttribute('data-size', 'medium');
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <IntentArc intentData={mockIntentData} className="custom-intent-arc" />
    );

    const intentArc = container.firstChild as HTMLElement;
    expect(intentArc).toHaveClass('custom-intent-arc');
  });

  it('shows tooltip on hover', async () => {
    render(<IntentArc intentData={mockIntentData} showLabels={true} />);

    const informLegendItem = screen.getByText('Inform').closest('div');
    fireEvent.mouseEnter(informLegendItem!);

    await waitFor(() => {
      expect(screen.getByText('Inform Intent')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('positive')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });
  });

  it('hides tooltip on mouse leave', async () => {
    render(<IntentArc intentData={mockIntentData} showLabels={true} />);

    const informLegendItem = screen.getByText('Inform').closest('div');
    fireEvent.mouseEnter(informLegendItem!);

    await waitFor(() => {
      expect(screen.getByText('Inform Intent')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(informLegendItem!);

    await waitFor(() => {
      expect(screen.queryByText('Inform Intent')).not.toBeInTheDocument();
    });
  });

  it('handles animation correctly', () => {
    render(<IntentArc intentData={mockIntentData} animate={true} />);

    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it('skips animation when animate is false', () => {
    render(<IntentArc intentData={mockIntentData} animate={false} />);

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('cleans up animation on unmount', () => {
    const { unmount } = render(<IntentArc intentData={mockIntentData} animate={true} />);

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles SVG path calculations correctly', () => {
    render(<IntentArc intentData={mockIntentData} />);
    
    // The SVG should be rendered with the correct viewBox
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveAttribute('viewBox', '0 0 132 132'); // For medium size
  });

  it('renders intent icons correctly', () => {
    render(<IntentArc intentData={mockIntentData} showLabels={true} />);
    
    // Check for intent icons in the legend
    expect(screen.getByText('📢')).toBeInTheDocument(); // inform
    expect(screen.getByText('❓')).toBeInTheDocument(); // question
    expect(screen.getByText('⚡')).toBeInTheDocument(); // action
  });

  it('handles different intent types with correct colors', () => {
    const diverseIntentData: IntentData[] = [
      { id: '1', type: 'inform', confidence: 0.8, progress: 25, timestamp: Date.now() },
      { id: '2', type: 'question', confidence: 0.7, progress: 25, timestamp: Date.now() },
      { id: '3', type: 'action', confidence: 0.9, progress: 25, timestamp: Date.now() },
      { id: '4', type: 'consensus', confidence: 0.6, progress: 25, timestamp: Date.now() },
      { id: '5', type: 'clarification', confidence: 0.5, progress: 25, timestamp: Date.now() },
      { id: '6', type: 'exploration', confidence: 0.4, progress: 25, timestamp: Date.now() },
    ];

    render(<IntentArc intentData={diverseIntentData} showLabels={true} />);
    
    expect(screen.getByText('Inform')).toBeInTheDocument();
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Consensus')).toBeInTheDocument();
    expect(screen.getByText('Clarification')).toBeInTheDocument();
    expect(screen.getByText('Exploration')).toBeInTheDocument();
  });

  it('handles missing metadata gracefully', () => {
    const intentDataWithoutMetadata: IntentData[] = [
      {
        id: 'intent-1',
        type: 'inform',
        confidence: 0.85,
        progress: 100,
        timestamp: Date.now(),
      },
    ];

    render(<IntentArc intentData={intentDataWithoutMetadata} showLabels={true} />);

    const informLegendItem = screen.getByText('Inform').closest('div');
    fireEvent.mouseEnter(informLegendItem!);

    // Should not crash and should show basic info
    expect(screen.getByText('Inform Intent')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles zero progress values', () => {
    const zeroProgressData: IntentData[] = [
      {
        id: 'intent-1',
        type: 'inform',
        confidence: 0.85,
        progress: 0,
        timestamp: Date.now(),
      },
    ];

    render(<IntentArc intentData={zeroProgressData} showLabels={true} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles single intent data', () => {
    const singleIntentData: IntentData[] = [
      {
        id: 'intent-1',
        type: 'inform',
        confidence: 0.85,
        progress: 100,
        timestamp: Date.now(),
      },
    ];

    render(<IntentArc intentData={singleIntentData} showLabels={true} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Inform')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles very large progress values', () => {
    const largeProgressData: IntentData[] = [
      {
        id: 'intent-1',
        type: 'inform',
        confidence: 0.85,
        progress: 999,
        timestamp: Date.now(),
      },
    ];

    render(<IntentArc intentData={largeProgressData} showLabels={true} />);
    
    expect(screen.getByText('999%')).toBeInTheDocument();
  });

  it('handles chat metadata prop', () => {
    render(
      <IntentArc 
        intentData={mockIntentData} 
        chatMetadata={mockChatMetadata}
        showLabels={true}
      />
    );
    
    // Should render normally with chat metadata
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Inform')).toBeInTheDocument();
  });

  it('handles showProgress prop correctly', () => {
    const { rerender } = render(
      <IntentArc intentData={mockIntentData} showProgress={true} showLabels={true} />
    );
    
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();

    rerender(<IntentArc intentData={mockIntentData} showProgress={false} showLabels={true} />);
    
    // Progress should still be shown in legend even when showProgress is false
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<IntentArc intentData={mockIntentData} showLabels={true} />);
    
    const legendItems = screen.getAllByRole('button');
    expect(legendItems).toHaveLength(3);
    
    legendItems.forEach((item, index) => {
      expect(item).toHaveAttribute('tabIndex', '0');
    });
  });

  it('handles focus management correctly', () => {
    render(<IntentArc intentData={mockIntentData} showLabels={true} />);
    
    const legendItems = screen.getAllByRole('button');
    const firstItem = legendItems[0];
    
    fireEvent.focus(firstItem);
    expect(firstItem).toHaveClass('hovered');
    
    fireEvent.blur(firstItem);
    expect(firstItem).not.toHaveClass('hovered');
  });

  it('handles rapid state changes gracefully', () => {
    const { rerender } = render(<IntentArc intentData={mockIntentData} />);
    
    // Rapidly change props
    rerender(<IntentArc intentData={[]} />);
    rerender(<IntentArc intentData={mockIntentData} />);
    rerender(<IntentArc intentData={mockIntentData.slice(0, 1)} />);
    
    // Should not crash
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles edge case with empty intent data array', () => {
    render(<IntentArc intentData={[]} />);
    
    expect(screen.getByText('No intent data available')).toBeInTheDocument();
  });

  it('handles edge case with single intent having zero progress', () => {
    const singleZeroProgress: IntentData[] = [
      {
        id: 'intent-1',
        type: 'inform',
        confidence: 0.85,
        progress: 0,
        timestamp: Date.now(),
      },
    ];

    render(<IntentArc intentData={singleZeroProgress} showLabels={true} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
}); 