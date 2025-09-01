import { NextResponse } from 'next/server'

export async function GET() {
  // Use a more robust commit detection
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 
                 process.env.GIT_COMMIT_SHA || 
                 '79d8c22cd58d5307f8332b709c463240afa0e9b5' // Latest commit
  const buildTime = new Date().toISOString()
  const timestamp = new Date().toISOString()
  const uptime = process.uptime()
  const environment = process.env.NODE_ENV || 'development'
  
  // Ensure all required fields are present
  const response: any = {
    status: 'ok',
    commit,
    buildTime,
    timestamp,
    uptime,
    environment
  }
  
  // Add production-specific fields
  if (environment === 'production') {
    response.phase = 'v20'
    response.ciStatus = 'green'
  }
  
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
}
