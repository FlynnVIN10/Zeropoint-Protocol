import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Synthient API test endpoint working',
    timestamp: new Date().toISOString(),
    status: 'ok'
  })
}
