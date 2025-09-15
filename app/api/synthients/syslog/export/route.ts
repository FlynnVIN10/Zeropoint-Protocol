import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')
    const severity = searchParams.get('severity')
    const synthient_type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '1000')

    // Build query parameters for the main syslog endpoint
    const params = new URLSearchParams()
    if (since) params.append('since', since)
    if (severity) params.append('severity', severity)
    if (synthient_type) params.append('type', synthient_type)
    params.append('limit', limit.toString())
    params.append('format', 'syslog')

    // Fetch logs in syslog format
    const baseUrl = request.nextUrl.origin
    const response = await fetch(`${baseUrl}/api/synthients/syslog?${params}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch syslog data')
    }

    const syslogData = await response.text()

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `synthient-syslog-${timestamp}.log`

    return new Response(syslogData, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('[SYNTHIENT SYSLOG EXPORT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to export Synthient syslog' },
      { status: 500 }
    )
  }
}
