# Directive: Phase 12 — Symbiotic Intelligence & WebXR Integration

**Date**: 2025-08-01  
**Phase**: 12  
**Status**: Pending  
**Assigned To**: Dev Team  
**Approved By**: CTO (OCEAN), CEO (Flynn)

## 🌐 Website & Chat Interface

### 1. Real-Time Symbiotic Chat Widget
- **Task**: Integrate a chat panel at `/dashboard` with SSE-backed message streaming from `/v1/chat/stream`.
- **Features**:
  - **Typing Indicator**: Implement `<TypingIndicator />` to display “Synthiant is typing…”.
  - **Persona Styling**: Style message bubbles using Tailwind + shadcn/ui. Example:
    ```jsx
    // src/components/ChatBubble.tsx
    import clsx from 'clsx';

    export function ChatBubble({ author, children }) {
      return (
        <div className={clsx(
          'p-3 rounded-xl max-w-xl my-2',
          author === 'synthiant'
            ? 'bg-synthiantGlow text-white self-start'
            : 'bg-humanWarmth text-gray-900 self-end'
        )}>
          {children}
        </div>
      );
    }
    ```
  - **Memory**: Persist last 50 messages in `localStorage`, sync to `/v1/chat/history` on reconnect.

## 💠 UX/UI Enhancements

### 2. Accessibility & Theming
- **Task**:
  - Audit all dashboard components for WCAG 2.1 AA compliance; ensure contrast ≥4.5:1 and keyboard focus.
  - Refactor component library: unify spacing (`p-4`, `m-2`), typography (`text-base`, `text-xl`), buttons (`btn`, `btn-hover`).
  - **Theme Toggle**: Add switch in header to toggle CSS variables:
    ```css
    /* src/styles/theme.css */
    :root[data-theme="synthiantGlow"] {
      --color-bg: #1F1B24;
      --color-accent: #00FFC4;
    }
    :root[data-theme="humanWarmth"] {
      --color-bg: #FFF8F1;
      --color-accent: #FF8C42;
    }
    ```
    ```jsx
    // src/components/ThemeToggle.tsx
    export function ThemeToggle() {
      const [theme, setTheme] = useState('synthiantGlow');
      useEffect(() => document.documentElement.setAttribute('data-theme', theme), [theme]);
      return (
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="synthiantGlow">Synthiant Glow</option>
          <option value="humanWarmth">Human Warmth</option>
        </select>
      );
    }
    ```

## 🖼 Visualizer & WebXR Preview

### 3. `<XRVisualizerPreview />` Deployment
- **Task**:
  - **Page**: Create `/visualizer` route with component:
    ```jsx
    // src/pages/visualizer.tsx
    import XRVisualizerPreview from '../components/XRVisualizerPreview';
    export default function VisualizerPage() {
      return <XRVisualizerPreview />;
    }
    ```
  - **Bridge Streaming**: Connect stubbed UE5 bridge via WebSocket to `/ws/visualizer`:
    ```typescript
    // src/components/XRVisualizerPreview.tsx
    import { useEffect } from 'react';
    export default function XRVisualizerPreview() {
      useEffect(() => {
        const ws = new WebSocket('wss://api.zp.ai/ws/visualizer');
        ws.onmessage = e => {/* render intent arcs */};
        return () => ws.close();
      }, []);
      return <canvas id="xr-canvas" className="w-full h-screen" />;
    }
    ```
  - **Performance Metrics**: Instrument FPS and frame time via `stats.js`; log to `/v1/telemetry/render`.

## 🔄 Feedback Loops & Telemetry

### 4. UX & Consensus Telemetry
- **Task**:
  - Capture chat events, visualizer interactions, and button clicks in telemetry:
    ```typescript
    // src/services/telemetry.service.ts
    export function trackEvent(name: string, props: object) {
      fetch('/v1/telemetry/event', {
        method: 'POST',
        body: JSON.stringify({ name, props, timestamp: Date.now() })
      });
    }
    ```
  - Extend `/v1/telemetry` schema to include `userEngagement` and `consensusEntropy`.
  - **Dashboard**: Add “Feedback” tab showing live chart of sentiment vs. entropy.

## 🚀 Phase 13 Vision Prep

### 5. Simulation Environments Doc
- **Task**: Create `docs/phase13_simulation_environments.md` with:
  - XR controls & UI flows
  - Avatar identity & spatial audio
  - Security model for multi-agent rooms
  - Consent & data privacy in VR

## 🗓 Milestones & Reporting
- **Milestone Dates**:
  - Chat Widget MVP: 2025-08-12
  - UX/UI Audit & Theming: 2025-08-18
  - XR Preview in Staging: 2025-08-22
  - Feedback Dashboard Prototype: 2025-08-29
  - Phase 13 Vision Document: 2025-09-05
- **Status Report**: Due `/PM-to-Dev-Team/status-reports/2025-08-08_status-report.md` by COB Aug 8.
- **Escalation**: Report blockers to PM & CTO within 30 minutes.

## 📌 Next Steps
- Embed this file as `/PM-to-Dev-Team/directives/2025-08-01_directive_phase12_symbiotic.md`.
- Notify Dev Team upon upload with standard PR comment and team channel message.

Proceed with symbiotic precision.