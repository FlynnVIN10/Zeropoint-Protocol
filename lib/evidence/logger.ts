// Evidence Logger for UI Actions
import fs from 'fs';
import path from 'path';

interface EvidenceEntry {
  method: string;
  url: string;
  headers: Record<string, string>;
  status: number;
  first120: string;
  timestamp: string;
  commit: string;
}

export class EvidenceLogger {
  private logPath: string;

  constructor(basePath: string = 'public/evidence/phase1') {
    this.logPath = basePath;
  }

  async logAction(
    method: string,
    url: string,
    headers: Record<string, string>,
    status: number,
    responseBody: string,
    commit: string
  ): Promise<void> {
    const entry: EvidenceEntry = {
      method,
      url,
      headers,
      status,
      first120: responseBody.slice(0, 120),
      timestamp: new Date().toISOString(),
      commit
    };

    // Determine subfolder based on URL
    let subfolder = 'ui';
    if (url.includes('/tinygrad')) subfolder = 'logs/tinygrad';
    else if (url.includes('/petals')) subfolder = 'logs/petals';
    else if (url.includes('/wondercraft')) subfolder = 'logs/wondercraft';
    else if (url.includes('/proposals')) subfolder = 'ui/proposals';

    const fullPath = path.join(this.logPath, subfolder);
    await fs.promises.mkdir(fullPath, { recursive: true });

    const fileName = `${method.toLowerCase()}_${Date.now()}.http`;
    const filePath = path.join(fullPath, fileName);

    const content = `HTTP/1.1 ${status} ${status === 200 ? 'OK' : 'Error'}\n${Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${responseBody}`;

    await fs.promises.writeFile(filePath, content, 'utf8');
    console.log(`Evidence logged: ${filePath}`);
  }

  // Client-side wrapper for fetch
  static async logFetch(
    url: string,
    options: RequestInit = {},
    commit: string
  ): Promise<Response> {
    const method = options.method || 'GET';
    const response = await fetch(url, options);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.clone().text();

    // Log in background (don't await)
    const logger = new EvidenceLogger();
    logger.logAction(method, url, headers, response.status, body, commit).catch(console.error);

    return response;
  }
}
