// training-debug.js - External JavaScript for training data loading and debugging
// Per CTO directive: Move inline scripts to external files to comply with CSP

console.log('=== JAVASCRIPT DEBUG START ===');
console.log('JavaScript loaded successfully');

// Helper: check if SSE debugging is enabled via URL (?sse=1). Default to enabled.
function isSSEEnabled() {
  try {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get('sse');
    return flag === null ? true : flag === '1';
  } catch {
    return true;
  }
}

// Training data loading function
async function loadTraining() {
  try {
    console.log('=== LOADING TRAINING DATA ===');
    console.log('Fetching from /api/synthient/status...');
    
    const r = await fetch('/api/synthient/status', { cache: 'no-store' });
    console.log('Response received:', { status: r.status, ok: r.ok, statusText: r.statusText });
    
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    
    const d = await r.json();
    console.log('Training data parsed successfully:', d);
    console.log('Data structure check:', {
      ok: d.ok,
      summary: d.summary,
      services: Object.keys(d.services || {}),
      has_services: !!d.services
    });
    
    // Update training metrics with detailed logging
    console.log('=== UPDATING DOM ELEMENTS ===');
    
    const activeRunsEl = document.getElementById('ts-active-runs');
    const completedTodayEl = document.getElementById('ts-completed-today');
    const totalRunsEl = document.getElementById('ts-total-runs');
    
    console.log('DOM elements before update:', {
      'ts-active-runs': activeRunsEl?.textContent || 'NOT_FOUND',
      'ts-completed-today': completedTodayEl?.textContent || 'NOT_FOUND',
      'ts-total-runs': totalRunsEl?.textContent || 'NOT_FOUND'
    });
    
    // Update training metrics from synthient status
    const services = d.services || {};
    const petals = services.petals || {};
    const wondercraft = services.wondercraft || {};
    const tinygrad = services.tinygrad || {};
    
    // Count active services
    const activeCount = Object.values(services).filter(s => s.ok).length;
    const totalCount = Object.keys(services).length;
    
    if (activeRunsEl) {
      activeRunsEl.textContent = activeCount.toString();
      console.log('Set ts-active-runs to:', activeCount);
    } else {
      console.error('ts-active-runs element not found!');
    }
    
    if (completedTodayEl) {
      completedTodayEl.textContent = d.ok ? 'All Online' : 'Partial';
      console.log('Set ts-completed-today to:', d.ok ? 'All Online' : 'Partial');
    } else {
      console.error('ts-completed-today element not found!');
    }
    
    if (totalRunsEl) {
      totalRunsEl.textContent = totalCount.toString();
      console.log('Set ts-total-runs to:', totalCount);
    } else {
      console.error('ts-total-runs element not found!');
    }
    
    // Update last run details from service data
    const lastModelEl = document.getElementById('ts-last-model');
    const lastAccuracyEl = document.getElementById('ts-last-accuracy');
    const lastLossEl = document.getElementById('ts-last-loss');
    
    // Find the most recently active service
    let lastService = null;
    let lastTime = 0;
    for (const [name, service] of Object.entries(services)) {
      if (service.data && service.data.lastContact) {
        const time = new Date(service.data.lastContact).getTime();
        if (time > lastTime) {
          lastTime = time;
          lastService = { name, ...service.data };
        }
      }
    }
    
    if (lastService) {
      if (lastModelEl) {
        lastModelEl.textContent = lastService.name || 'N/A';
        console.log('Set ts-last-model to:', lastService.name || 'N/A');
      }
      
      if (lastAccuracyEl) {
        lastAccuracyEl.textContent = lastService.configured ? 'Configured' : 'Not Configured';
        console.log('Set ts-last-accuracy to:', lastService.configured ? 'Configured' : 'Not Configured');
      }
      
      if (lastLossEl) {
        lastLossEl.textContent = lastService.active ? 'Active' : 'Inactive';
        console.log('Set ts-last-loss to:', lastService.active ? 'Active' : 'Inactive');
      }
    } else {
      if (lastModelEl) lastModelEl.textContent = 'N/A';
      if (lastAccuracyEl) lastAccuracyEl.textContent = 'N/A';
      if (lastLossEl) lastLossEl.textContent = 'N/A';
      console.log('No service data available');
    }
    
    const commitEl = document.getElementById('ts-commit');
    const timestampEl = document.getElementById('ts-timestamp');
    
    if (commitEl) {
      commitEl.textContent = 'N/A'; // No commit info in synthient status
      console.log('Set ts-commit to: N/A');
    }
    
    if (timestampEl) {
      timestampEl.textContent = d.updated_at ? 
        new Date(d.updated_at).toLocaleString() : 'N/A';
      console.log('Set ts-timestamp to:', d.updated_at ? 
        new Date(d.updated_at).toLocaleString() : 'N/A');
    }

    // Update leaderboard with service status
    const leaderboardDiv = document.getElementById('ts-leaderboard');
    if (leaderboardDiv) {
      leaderboardDiv.innerHTML = ''; // Clear previous content
      if (d.summary) {
        leaderboardDiv.innerHTML = `<strong>Status Summary:</strong><br>${d.summary}`;
        console.log('Updated leaderboard with summary:', d.summary);
      } else {
        leaderboardDiv.textContent = 'No status data available.';
        console.log('Set leaderboard to: No status data available.');
      }
    }
    
    // Verify DOM elements after update
    console.log('DOM elements after update:', {
      'ts-active-runs': document.getElementById('ts-active-runs')?.textContent || 'NOT_FOUND',
      'ts-completed-today': document.getElementById('ts-completed-today')?.textContent || 'NOT_FOUND',
      'ts-total-runs': document.getElementById('ts-total-runs')?.textContent || 'NOT_FOUND',
      'ts-last-model': document.getElementById('ts-last-model')?.textContent || 'NOT_FOUND',
      'ts-last-accuracy': document.getElementById('ts-last-accuracy')?.textContent || 'NOT_FOUND',
      'ts-last-loss': document.getElementById('ts-last-loss')?.textContent || 'NOT_FOUND',
      'ts-commit': document.getElementById('ts-commit')?.textContent || 'NOT_FOUND',
      'ts-timestamp': document.getElementById('ts-timestamp')?.textContent || 'NOT_FOUND'
    });
    
    console.log('=== DOM UPDATE COMPLETE ===');
    
  } catch (e) {
    console.error('Error in loadTraining:', e);
    const elements = [
      'ts-active-runs', 'ts-completed-today', 'ts-total-runs', 
      'ts-last-model', 'ts-last-accuracy', 'ts-last-loss', 
      'ts-commit', 'ts-timestamp', 'ts-leaderboard'
    ];
    elements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === 'ts-leaderboard') {
          el.textContent = 'Error loading status';
        } else {
          el.textContent = 'Error';
        }
      }
    });
  }
}

// Communication form handler
async function handleCommunicationForm(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="text"]');
  const q = input.value.trim();
  
  if (!q) return;
  
  const responseArea = document.getElementById('response-area');
  const telemetryEl = document.getElementById('telemetry');

  // Append user message
  const userBlock = document.createElement('div');
  userBlock.style.marginBottom = '8px';
  userBlock.innerHTML = `<strong>You:</strong> ${q}`;
  responseArea.appendChild(userBlock);
  responseArea.scrollTop = responseArea.scrollHeight;
  if (telemetryEl) telemetryEl.textContent = 'Processing...';
  
  try {
    const r = await fetch('/api/router/exec?q=' + encodeURIComponent(q), { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    
    // Append assistant response
    const aiBlock = document.createElement('div');
    aiBlock.style.margin = '8px 0 12px 0';
    if (j.status === 'success') {
      aiBlock.innerHTML = `<strong>Response:</strong> ${j.response}`;
    } else if (j.error === 'not_configured') {
      aiBlock.innerHTML = `<strong>Response:</strong> Live LLM not configured. Ask PM to set OPENAI_API_KEY or Workers AI.`;
    } else {
      aiBlock.innerHTML = `<strong>Response:</strong> ${j.response || 'No response received'}`;
    }
    responseArea.appendChild(aiBlock);
    responseArea.scrollTop = responseArea.scrollHeight;
    
    // Update telemetry
    const t = j.telemetry || {};
    if (telemetryEl) telemetryEl.textContent = `provider=${t.provider||'unknown'} instance=${t.instance||'none'} latency=${t.latencyMs||'-'}ms`;
    
    // Clear input but keep focus for continued chatting
    input.value = '';
    input.focus();
  } catch (error) {
    console.error('Communication error:', error);
    const errBlock = document.createElement('div');
    errBlock.style.margin = '8px 0 12px 0';
    errBlock.style.color = '#ff6b6b';
    errBlock.textContent = 'Error: ' + (error instanceof Error ? error.message : 'Unknown error');
    responseArea.appendChild(errBlock);
    if (telemetryEl) telemetryEl.textContent = 'Request failed';
  }
}

// Marquee function for tickers
function marquee(element, text) {
  if (element) {
    element.textContent = text;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing training data...');
  
  // Verify DOM elements exist
  const activeRunsEl = document.getElementById('ts-active-runs');
  const completedTodayEl = document.getElementById('ts-completed-today');
  const totalRunsEl = document.getElementById('ts-total-runs');
  
  console.log('DOM elements check:', {
    'ts-active-runs': !!activeRunsEl,
    'ts-completed-today': !!completedTodayEl,
    'ts-total-runs': !!totalRunsEl
  });
  
  if (activeRunsEl) {
    activeRunsEl.textContent = 'Initializing...';
    console.log('DOM elements found successfully');
  } else {
    console.error('DOM element ts-active-runs not found!');
    // Try to find any training-related elements
    const allElements = document.querySelectorAll('[id^="ts-"]');
    console.log('Found training elements:', Array.from(allElements).map(el => el.id));
  }
  
  // Load training data on page load
  try {
    loadTraining();
  } catch (error) {
    console.error('Error calling loadTraining:', error);
    if (activeRunsEl) activeRunsEl.textContent = 'JS Error: ' + (error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Refresh training data every 30 seconds
  setInterval(() => {
    try {
      loadTraining();
    } catch (error) {
      console.error('Error in training interval:', error);
    }
  }, 30000);
  
  // SSE ticker setup (default enabled; disable with ?sse=0)
  if (isSSEEnabled() && 'EventSource' in window) {
    console.log('SSE enabled. Initializing event streams...');
    try {
      const top = new EventSource('/api/events/consensus');
      top.addEventListener('consensus', (e) => {
        const d = JSON.parse(e.data);
        marquee(document.getElementById('top-ticker'), `[consensus] ${d.state} #${d.seq} ${d.ts}`);
      });
    } catch (err) {
      console.warn('Top SSE initialization failed:', err);
    }
    
    try {
      const bottom = new EventSource('/api/events/synthient');
      bottom.addEventListener('tick', (e) => {
        const d = JSON.parse(e.data);
        marquee(document.getElementById('bottom-ticker'), `[synthient] ${d.msg} #${d.seq} ${d.ts}`);
      });
    } catch (err) {
      console.warn('Bottom SSE initialization failed:', err);
    }
  } else {
    console.log('SSE disabled (enable with ?sse=1)');
  }
  
  // Set up communication form
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', handleCommunicationForm);
  }
  
  console.log('Initialization complete');
});

console.log('training-debug.js loaded successfully');
