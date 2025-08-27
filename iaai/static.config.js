module.exports = { status: 'ok' };
/**
 * Static Asset Configuration - Performance and Caching
 *
 * @fileoverview Configures cache-control, ETag, and performance optimization for static assets
 * @author Dev Team
 * @version 1.0.0
 */

const path = require('path');
const crypto = require('crypto');

// Cache control configuration for different asset types
const cacheConfig = {
  // Strong caching for static assets with content hash
  static: {
    maxAge: 31536000, // 1 year
    immutable: true,
    public: true,
    mustRevalidate: false
  },
  
  // Medium caching for compiled assets
  compiled: {
    maxAge: 86400, // 1 day
    immutable: false,
    public: true,
    mustRevalidate: true
  },
  
  // Short caching for dynamic content
  dynamic: {
    maxAge: 300, // 5 minutes
    immutable: false,
    public: true,
    mustRevalidate: true
  },
  
  // No caching for sensitive content
  sensitive: {
    maxAge: 0,
    immutable: false,
    public: false,
    mustRevalidate: true,
    noCache: true,
    noStore: true
  }
};

// Asset type mapping
const assetTypes = {
  // Static assets - strong caching
  '.js': 'static',
  '.css': 'static',
  '.png': 'static',
  '.jpg': 'static',
  '.jpeg': 'static',
  '.gif': 'static',
  '.svg': 'static',
  '.ico': 'static',
  '.woff': 'static',
  '.woff2': 'static',
  '.ttf': 'static',
  '.eot': 'static',
  
  // Compiled assets - medium caching
  '.map': 'compiled',
  '.min.js': 'compiled',
  '.min.css': 'compiled',
  
  // Dynamic content - short caching
  '.html': 'dynamic',
  '.json': 'dynamic',
  '.xml': 'dynamic',
  '.txt': 'dynamic',
  
  // Sensitive content - no caching
  '.env': 'sensitive',
  '.key': 'sensitive',
  '.pem': 'sensitive',
  '.crt': 'sensitive'
};

/**
 * Generate cache-control header for asset
 */
function getCacheControlHeader(assetPath) {
  const ext = path.extname(assetPath).toLowerCase();
  const assetType = assetTypes[ext] || 'dynamic';
  const config = cacheConfig[assetType];
  
  let header = `public, max-age=${config.maxAge}`;
  
  if (config.immutable) {
    header += ', immutable';
  }
  
  if (config.mustRevalidate) {
    header += ', must-revalidate';
  }
  
  if (config.noCache) {
    header = 'no-cache';
  }
  
  if (config.noStore) {
    header = 'no-store';
  }
  
  return header;
}

/**
 * Generate ETag for asset content
 */
function generateETag(content) {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

/**
 * Generate Last-Modified header
 */
function generateLastModified() {
  return new Date().toUTCString();
}

/**
 * Check if asset should be cached
 */
function shouldCache(assetPath) {
  const ext = path.extname(assetPath).toLowerCase();
  const assetType = assetTypes[ext] || 'dynamic';
  return cacheConfig[assetType].maxAge > 0;
}

/**
 * Get cache key for asset
 */
function getCacheKey(assetPath, content) {
  const ext = path.extname(assetPath).toLowerCase();
  const assetType = assetTypes[ext] || 'dynamic';
  
  if (assetType === 'static') {
    // Use content hash for static assets
    return generateETag(content);
  } else {
    // Use path and modification time for other assets
    return `${assetPath}-${Date.now()}`;
  }
}

/**
 * Performance budget configuration
 */
const performanceBudget = {
  // Lighthouse performance thresholds
  lighthouse: {
    performance: 0.90,
    accessibility: 0.95,
    bestPractices: 0.90,
    seo: 0.90
  },
  
  // Asset size limits
  assetSizes: {
    js: 500 * 1024, // 500KB
    css: 100 * 1024, // 100KB
    images: 2 * 1024 * 1024, // 2MB
    fonts: 500 * 1024 // 500KB
  },
  
  // Response time limits
  responseTimes: {
    static: 100, // 100ms
    api: 500, // 500ms
    database: 1000 // 1s
  }
};

/**
 * Compression configuration
 */
const compressionConfig = {
  enabled: true,
  threshold: 1024, // Only compress files > 1KB
  level: 6, // Compression level (0-9)
  algorithms: ['gzip', 'deflate', 'br']
};

module.exports = {
  cacheConfig,
  assetTypes,
  getCacheControlHeader,
  generateETag,
  generateLastModified,
  shouldCache,
  getCacheKey,
  performanceBudget,
  compressionConfig
};
