/**
 * Sonic MAX Cursor Playbook - Phase 5 HTTP Helper Library
 * Fetch JSON/TXT with retries and redirect handling
 * Tag: [SONIC-MAX][PHASE5]
 */

const https = require('https');
const http = require('http');

/**
 * Fetch JSON from URL with retries and redirect handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response object with statusCode and data
 */
async function fetchJSON(url, options = {}) {
  const response = await fetchWithRetries(url, options);
  
  try {
    const data = JSON.parse(response.data);
    return {
      ...response,
      data
    };
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${url}: ${error.message}`);
  }
}

/**
 * Fetch text from URL with retries and redirect handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response object with statusCode and data
 */
async function fetchText(url, options = {}) {
  return fetchWithRetries(url, options);
}

/**
 * Fetch with retries and redirect handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response object
 */
async function fetchWithRetries(url, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 10000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchSingle(url, timeout);
      
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400) {
        const location = response.headers.location;
        if (location && attempt < maxRetries) {
          console.log(`🔄 Redirect ${response.statusCode} -> ${location} (attempt ${attempt})`);
          url = location.startsWith('http') ? location : new URL(location, url).href;
          continue;
        }
      }
      
      return response;
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts: ${error.message}`);
      }
      
      console.log(`⚠️  Attempt ${attempt} failed, retrying... (${error.message})`);
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

/**
 * Single fetch operation
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Response object
 */
function fetchSingle(url, timeout) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  fetchJSON,
  fetchText,
  fetchWithRetries
};
