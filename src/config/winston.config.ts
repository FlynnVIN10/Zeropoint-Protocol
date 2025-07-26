// © [2025] Zeropoint Protocol, LLC. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

const logDir = process.env.LOG_DIR || 'logs';
const logLevel = process.env.LOG_LEVEL || 'info';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      let log = `${timestamp} [${level}]: ${message}`;
      
      if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
      }
      
      if (stack) {
        log += `\n${stack}`;
      }
      
      return log;
    })
  )
});

// Daily rotate file transport for application logs
const appLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: logFormat
});

// Daily rotate file transport for error logs
const errorLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat
});

// Daily rotate file transport for access logs
const accessLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: logFormat
});

// Daily rotate file transport for audit logs
const auditLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'audit-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d',
  level: 'info',
  format: logFormat
});

// Create Winston logger configuration
export const winstonConfig = WinstonModule.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'zeropoint-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    consoleTransport,
    appLogTransport,
    errorLogTransport
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat
    })
  ]
});

// Create specialized loggers
export const accessLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'zeropoint-api-access' },
  transports: [accessLogTransport]
});

export const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'zeropoint-api-audit' },
  transports: [auditLogTransport]
});

export const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  defaultMeta: { service: 'zeropoint-api-security' },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
      format: logFormat
    })
  ]
});

// Log rotation event handlers
appLogTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`Application log rotated from ${oldFilename} to ${newFilename}`);
});

errorLogTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`Error log rotated from ${oldFilename} to ${newFilename}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing log files...');
  appLogTransport.close();
  errorLogTransport.close();
  accessLogTransport.close();
  auditLogTransport.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing log files...');
  appLogTransport.close();
  errorLogTransport.close();
  accessLogTransport.close();
  auditLogTransport.close();
  process.exit(0);
}); 