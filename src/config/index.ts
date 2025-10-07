/**
 * Centralized configuration module
 * Per CTO directive: Typed config loaders, no unsafe defaults
 */

import { env, NODE_ENV, DATABASE_URL, MOCKS_DISABLED, PORT } from './env';

export { env, NODE_ENV, DATABASE_URL, MOCKS_DISABLED, PORT };

/**
 * Runtime configuration
 */
export const config = {
  /**
   * Is this a development environment?
   */
  isDev: NODE_ENV === 'development',
  
  /**
   * Is this a production environment?
   */
  isProd: NODE_ENV === 'production',
  
  /**
   * Is this a test environment?
   */
  isTest: NODE_ENV === 'test',
  
  /**
   * Are mocks disabled? (should be true in production)
   */
  mocksDisabled: MOCKS_DISABLED === '1',
  
  /**
   * Server port
   */
  port: parseInt(PORT, 10),
  
  /**
   * Database connection string
   */
  database: {
    url: DATABASE_URL,
  },
} as const;

