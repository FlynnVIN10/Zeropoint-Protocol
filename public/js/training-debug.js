// training-debug.js - External JavaScript for training data loading and debugging
// Per CTO directive: Move inline scripts to external files to comply with CSP

console.log('=== JAVASCRIPT DEBUG START ===');
console.log('JavaScript loaded successfully');

// Training data loading function
async function loadTraining() {
  try {
    console.log('=== LOADING TRAINING DATA ===');
    console.log('Fetching from /api/training/status...');
    
    const r = await fetch('/api/training/status', { cache: 'no-store' });
    console.log('Response received:', { status: r.status, ok: r.ok, statusText: r.statusText });
    
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    
    const d = await r.json();
    console.log('Training data parsed successfully:', d);
    console.log('Data structure check:', {
      active_runs: d.active_runs,
      completed_today: d.completed_today,
      total_runs: d.total_runs,
      has_last_run: !!d.last_run,
      leaderboard_length: d.leaderboard?.length || 0
    });
    
    // Update training metrics
    document.getElementById('ts-active-runs').textContent = d.active_runs || '0';
    document.getElementById('ts-completed-today').textContent = d.completed_today || '0';
    document.getElementById('ts-total-runs').textContent = d.total_runs || '0';
    
    // Update last run details
    if (d.last_run) {
      document.getElementById('ts-last-model').textContent = d.last_run.model || 'N/A';
      document.getElementById('ts-last-accuracy').textContent = d.last_run.metrics?.accuracy ? 
        (d.last_run.metrics.accuracy * 100).toFixed(1) + '%' : 'N/A';
      document.getElementById('ts-last-loss').textContent = d.last_run.metrics?.loss ? 
        d.last_run.metrics.loss.toFixed(4) : 'N/A';
    } else {
      document.getElementById('ts-last-model').textContent = 'N/A';
      document.getElementById('ts-last-accuracy').textContent = 'N/A';
      document.getElementById('ts-last-loss').textContent = 'N/A';
    }
    
    document.getElementById('ts-commit').textContent = d.commit || 'N/A';
    document.getElementById('ts-timestamp').textContent = d.timestamp ? 
      new Date(d.timestamp).toLocaleString() : 'N/A';

    // Update leaderboard
    const leaderboardDiv = document.getElementById('ts-leaderboard');
    leaderboardDiv.innerHTML = ''; // Clear previous content
    if (d.leaderboard && d.leaderboard.length > 0) {
      leaderboardDiv.innerHTML = '<strong>Top Models:</strong><br>';
      d.leaderboard.forEach(item => {
        leaderboardDiv.innerHTML += `#${item.rank} ${item.model} (${(item.accuracy * 100).toFixed(1)}%) - ${item.runs} runs<br>`;
      });
    } else {
      leaderboardDiv.textContent = 'No leaderboard data available.';
    }
  } catch (e) {
    console.error('Error in loadTraining:', e);
    document.getElementById('ts-active-runs').textContent = 'Error';
    document.getElementById('ts-completed-today').textContent = '';
    document.getElementById('ts-total-runs').textContent = '';
    document.getElementById('ts-last-model').textContent = '';
    document.getElementById('ts-last-accuracy').textContent = '';
    document.getElementById('ts-last-loss').textContent = '';
    document.getElementById('ts-commit').textContent = '';
    document.getElementById('ts-timestamp').textContent = '';
    document.getElementById('ts-leaderboard').textContent = 'Error loading leaderboard';
  }
}

// Communication form handler
async function handleCommunicationForm(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="text"]');
  const q = input.value.trim();
  
  if (!q) return;
  
  try {
    const r = await fetch('/api/router/exec.json?q=' + encodeURIComponent(q), { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    
    if (j.response) {
      // Display response in the center panel
      const centerPanel = document.querySelector('.center-panel');
      if (centerPanel) {
        centerPanel.innerHTML = `<div style="padding: 20px;"><h3>Response:</h3><p>${j.response}</p></div>`;
      }
    }
    
    input.value = '';
  } catch (error) {
    console.error('Communication error:', error);
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
  
  // Set up communication form
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', handleCommunicationForm);
  }
  
  // Set up event sources for tickers
  try {
    const top = new EventSource('/api/events/synthient');
    top.addEventListener('tick', (e) => {
      const d = JSON.parse(e.data);
      marquee(document.getElementById('top-ticker'), `[synthient] ${d.msg} #${d.seq} ${d.ts}`);
    });
  } catch {}
  
  try {
    const bottom = new EventSource('/api/events/synthient');
    bottom.addEventListener('tick', (e) => {
      const d = JSON.parse(e.data);
      marquee(document.getElementById('bottom-ticker'), `[synthient] ${d.msg} #${d.seq} ${d.ts}`);
    });
  } catch {}
  
  console.log('Initialization complete');
});

console.log('training-debug.js loaded successfully');
