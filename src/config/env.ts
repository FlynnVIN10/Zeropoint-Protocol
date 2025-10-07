import { z } from 'zod';

/**
 * Environment variable schema with Zod validation
 * Per CTO directive: No defaults that enable network egress
 */

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Feature flags
  LOCAL_MODE: z.string().optional().default('1'),
  MOCKS_DISABLED: z.string().optional().default('0'),
  
  // Server
  PORT: z.string().optional().default('3000'),
  
  // Build metadata (CI-provided)
  COMMIT_SHA: z.string().optional(),
  BUILD_TIME: z.string().optional(),
  CI_STATUS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and export environment variables
 * Throws if validation fails
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error(JSON.stringify(error.issues, null, 2));
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Export individual values for convenience
export const {
  NODE_ENV,
  DATABASE_URL,
  LOCAL_MODE,
  MOCKS_DISABLED,
  PORT,
  COMMIT_SHA,
  BUILD_TIME,
  CI_STATUS,
} = env;

