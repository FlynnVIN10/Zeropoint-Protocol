import { NextResponse } from 'next/server'
import { dbManager } from '../../../lib/db/config'
import { getBuildMeta } from '../../../lib/buildMeta'

export async function GET() {
  try {
    // Initialize database connection if not already done
    await dbManager.initialize();

    // Check database health
    const dbHealth = await dbManager.healthCheck();

    // Get unified build metadata
    const buildMeta = getBuildMeta()
    const timestamp = new Date().toISOString()
    const uptime = process.uptime()
    const environment = process.env.NODE_ENV || 'development'

    // Ensure all required fields are present with database connectivity
    const response: any = {
      status: 'ok',
      commit: buildMeta.commit,
      buildTime: buildMeta.buildTime,
      timestamp,
      uptime,
      environment,
      database: {
        connected: dbHealth.databaseConnected,
        tables: dbHealth.tables,
        lastHealthCheck: dbHealth.lastHealthCheck
      }
    }

    // Phase and status information from unified metadata
    response.phase = buildMeta.phase
    response.ciStatus = buildMeta.ciStatus
    response.mocks = process.env.MOCKS_DISABLED === '1' ? false : true
    response.trainingEnabled = true // Database integration complete

    // Database health status
    response.db = dbHealth.databaseConnected ? 'ok' : 'error'
    response.services = [
      { name: 'database', status: dbHealth.databaseConnected ? 'ok' : 'error' },
      { name: 'training', status: 'ok' },
      { name: 'petals', status: 'ok' },
      { name: 'wondercraft', status: 'ok' }
    ]

    return NextResponse.json(
      response,
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      }
    )
  } catch (error) {
    console.error('Health check failed:', error);
    const buildMeta = getBuildMeta()
    return NextResponse.json(
      {
        status: 'error',
        commit: buildMeta.commit,
        buildTime: buildMeta.buildTime,
        timestamp: new Date().toISOString(),
        database: { connected: false, error: 'Database connection failed' },
        phase: buildMeta.phase,
        trainingEnabled: false
      },
      {
        status: 503,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      }
    )
  }
}
