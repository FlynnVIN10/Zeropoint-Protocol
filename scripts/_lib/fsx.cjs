/**
 * Sonic MAX Cursor Playbook - Phase 5 File System Utilities
 * File system utilities for directory creation and writing
 * Tag: [SONIC-MAX][PHASE5]
 */

const fs = require('fs');
const path = require('path');

/**
 * Write JSON to file with timestamp
 * @param {string} filepath - File path to write to
 * @param {Object} data - Data to write
 * @param {Object} options - Write options
 * @returns {Promise<void>}
 */
async function writeJSON(filepath, data, options = {}) {
  const dir = path.dirname(filepath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Add timestamp if not present
  const dataWithTimestamp = {
    ...data,
    _writtenAt: new Date().toISOString()
  };
  
  // Write file
  const jsonString = JSON.stringify(dataWithTimestamp, null, options.pretty ? 2 : 0);
  fs.writeFileSync(filepath, jsonString, 'utf8');
  
  console.log(`📝 Wrote JSON to: ${filepath}`);
}

/**
 * Read JSON from file
 * @param {string} filepath - File path to read from
 * @returns {Promise<Object>} Parsed JSON data
 */
async function readJSON(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
}

/**
 * Ensure directory exists
 * @param {string} dirpath - Directory path
 * @returns {Promise<void>}
 */
async function ensureDir(dirpath) {
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
    console.log(`📁 Created directory: ${dirpath}`);
  }
}

/**
 * List files in directory
 * @param {string} dirpath - Directory path
 * @param {string} pattern - File pattern (optional)
 * @returns {Promise<string[]>} Array of file paths
 */
async function listFiles(dirpath, pattern = null) {
  if (!fs.existsSync(dirpath)) {
    return [];
  }
  
  const files = fs.readdirSync(dirpath);
  
  if (pattern) {
    const regex = new RegExp(pattern);
    return files.filter(file => regex.test(file));
  }
  
  return files;
}

/**
 * Check if file exists
 * @param {string} filepath - File path
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filepath) {
  return fs.existsSync(filepath);
}

/**
 * Get file stats
 * @param {string} filepath - File path
 * @returns {Promise<Object>} File stats
 */
async function getFileStats(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  
  const stats = fs.statSync(filepath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory()
  };
}

module.exports = {
  writeJSON,
  readJSON,
  ensureDir,
  listFiles,
  fileExists,
  getFileStats
};
