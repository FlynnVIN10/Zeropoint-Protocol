import { NextRequest } from 'next/server';
import { spawn, ChildProcess } from 'child_process';

let logProcess: ChildProcess | null = null;
let clients: Set<ReadableStreamDefaultController> = new Set();

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Start log monitoring if not already running
      if (!logProcess) {
        startLogMonitoring();
      }

      // Send initial connection message
      const welcomeMsg = {
        type: 'system',
        message: 'Connected to Zeropoint Protocol syslog feed',
        timestamp: new Date().toISOString(),
        level: 'info'
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcomeMsg)}\n\n`));

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clients.delete(controller);
        if (clients.size === 0 && logProcess) {
          logProcess.kill();
          logProcess = null;
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

function startLogMonitoring() {
  // Monitor Next.js logs and platform logs
  // Use journalctl for system logs or tail for application logs
  const logCommand = process.platform === 'darwin' ? 
    'tail -f /var/log/system.log 2>/dev/null || echo "No system logs available"' :
    'journalctl -f --no-pager --output=short-precise 2>/dev/null || echo "No system logs available"';

  logProcess = spawn('sh', ['-c', logCommand], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let buffer = '';

  logProcess.stdout?.on('data', (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    lines.forEach(line => {
      if (line.trim()) {
        const logEntry = parseLogLine(line.trim());
        if (logEntry && isRelevantLog(logEntry)) {
          broadcastLog(logEntry);
        }
      }
    });
  });

  logProcess.stderr?.on('data', (data: Buffer) => {
    // Handle stderr as well
    const errorMsg = data.toString().trim();
    if (errorMsg) {
      const logEntry = {
        type: 'error',
        message: errorMsg,
        timestamp: new Date().toISOString(),
        level: 'error',
        source: 'stderr'
      };
      broadcastLog(logEntry);
    }
  });

  logProcess.on('close', (code) => {
    console.log(`Log monitoring process exited with code ${code}`);
    logProcess = null;
  });

  logProcess.on('error', (error) => {
    console.error('Log monitoring error:', error);
    // Send error to all clients
    const errorMsg = {
      type: 'system',
      message: `Log monitoring error: ${error.message}`,
      timestamp: new Date().toISOString(),
      level: 'error'
    };
    broadcastLog(errorMsg);
  });
}

function parseLogLine(line: string) {
  try {
    // Try to parse structured logs first
    const jsonMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.+)$/);
    if (jsonMatch) {
      return {
        type: 'application',
        message: jsonMatch[2],
        timestamp: jsonMatch[1],
        level: 'info',
        source: 'application'
      };
    }

    // Parse system log format
    const syslogMatch = line.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(.+)$/);
    if (syslogMatch) {
      return {
        type: 'system',
        message: syslogMatch[2],
        timestamp: new Date().toISOString(), // Use current time for system logs
        level: 'info',
        source: 'system'
      };
    }

    // Default parsing
    return {
      type: 'unknown',
      message: line,
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'unknown'
    };
  } catch (error) {
    return {
      type: 'error',
      message: `Log parsing error: ${error}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      source: 'parser'
    };
  }
}

function isRelevantLog(logEntry: any): boolean {
  const message = logEntry.message.toLowerCase();
  
  // Filter for relevant platform logs
  const relevantKeywords = [
    'zeropoint', 'synthient', 'training', 'consensus', 'governance',
    'proposal', 'vote', 'trainer', 'inference', 'petals', 'tinygrad',
    'error', 'warning', 'failed', 'success', 'started', 'stopped',
    'database', 'api', 'health', 'ready', 'sse', 'connection'
  ];

  // Exclude noise
  const noiseKeywords = [
    'debug', 'trace', 'heartbeat', 'ping', 'pong', 'keepalive'
  ];

  const hasRelevant = relevantKeywords.some(keyword => message.includes(keyword));
  const hasNoise = noiseKeywords.some(keyword => message.includes(keyword));

  return hasRelevant && !hasNoise;
}

function broadcastLog(logEntry: any) {
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify(logEntry)}\n\n`;
  const chunk = encoder.encode(data);

  clients.forEach(controller => {
    try {
      controller.enqueue(chunk);
    } catch (error) {
      // Remove dead clients
      clients.delete(controller);
    }
  });
}
