import { NextRequest, NextResponse } from 'next/server'

interface NetworkInstance {
  instance_id: string
  hostname: string
  ip_address: string
  status: 'online' | 'offline' | 'maintenance'
  capabilities: string[]
  performance_metrics: {
    latency_ms: number
    throughput_mbps: number
    error_rate: number
    uptime_percentage: number
  }
  consensus_participation: {
    total_proposals: number
    approved_proposals: number
    vetoed_proposals: number
    response_time_avg_ms: number
  }
  last_heartbeat: string
  version: string
  region: string
}

// In-memory storage for network instances (in production, this would be a database)
let networkInstances: NetworkInstance[] = []
let instanceCounter = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      hostname, 
      ip_address, 
      capabilities, 
      performance_metrics, 
      version, 
      region 
    } = body

    if (!hostname || !ip_address) {
      return NextResponse.json(
        { error: 'Missing required fields: hostname, ip_address' },
        { status: 400 }
      )
    }

    const instance: NetworkInstance = {
      instance_id: `inst-${instanceCounter++}`,
      hostname,
      ip_address,
      status: 'online',
      capabilities: capabilities || [],
      performance_metrics: performance_metrics || {
        latency_ms: 0,
        throughput_mbps: 0,
        error_rate: 0,
        uptime_percentage: 100
      },
      consensus_participation: {
        total_proposals: 0,
        approved_proposals: 0,
        vetoed_proposals: 0,
        response_time_avg_ms: 0
      },
      last_heartbeat: new Date().toISOString(),
      version: version || '1.0.0',
      region: region || 'unknown'
    }

    networkInstances.push(instance)

    return NextResponse.json({
      success: true,
      instance_id: instance.instance_id,
      message: 'Network instance registered successfully'
    }, {
      status: 201,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const region = searchParams.get('region')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredInstances = networkInstances
    
    if (status) {
      filteredInstances = filteredInstances.filter(i => i.status === status)
    }
    
    if (region) {
      filteredInstances = filteredInstances.filter(i => i.region === region)
    }
    
    // Sort by performance score and limit results
    filteredInstances = filteredInstances
      .sort((a, b) => {
        const scoreA = calculateInstanceScore(a)
        const scoreB = calculateInstanceScore(b)
        return scoreB - scoreA
      })
      .slice(0, limit)

    // Calculate network statistics
    const networkStats = calculateNetworkStats(filteredInstances)

    return NextResponse.json({
      instances: filteredInstances,
      network_statistics: networkStats,
      total_instances: networkInstances.length,
      online_instances: networkInstances.filter(i => i.status === 'online').length
    }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch network instances' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { instance_id, status, performance_metrics, consensus_participation } = body

    if (!instance_id) {
      return NextResponse.json(
        { error: 'Missing required field: instance_id' },
        { status: 400 }
      )
    }

    const instanceIndex = networkInstances.findIndex(i => i.instance_id === instance_id)
    if (instanceIndex === -1) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Update instance data
    if (status) networkInstances[instanceIndex].status = status
    if (performance_metrics) networkInstances[instanceIndex].performance_metrics = performance_metrics
    if (consensus_participation) networkInstances[instanceIndex].consensus_participation = consensus_participation
    
    networkInstances[instanceIndex].last_heartbeat = new Date().toISOString()

    return NextResponse.json({
      success: true,
      message: 'Instance updated successfully',
      instance_id
    }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update instance' },
      { status: 500 }
    )
  }
}

function calculateInstanceScore(instance: NetworkInstance): number {
  let score = 100
  
  // Performance-based scoring
  if (instance.performance_metrics.latency_ms < 50) score += 20
  else if (instance.performance_metrics.latency_ms < 100) score += 10
  else if (instance.performance_metrics.latency_ms > 500) score -= 20
  
  if (instance.performance_metrics.uptime_percentage > 99.9) score += 15
  else if (instance.performance_metrics.uptime_percentage < 95) score -= 15
  
  if (instance.performance_metrics.error_rate < 0.01) score += 10
  else if (instance.performance_metrics.error_rate > 0.1) score -= 10
  
  // Consensus participation scoring
  const approvalRate = instance.consensus_participation.total_proposals > 0 
    ? instance.consensus_participation.approved_proposals / instance.consensus_participation.total_proposals
    : 0
  
  if (approvalRate > 0.8) score += 15
  else if (approvalRate < 0.5) score -= 10
  
  return Math.max(0, Math.min(100, score))
}

function calculateNetworkStats(instances: NetworkInstance[]) {
  if (instances.length === 0) {
    return {
      total_instances: 0,
      online_instances: 0,
      avg_latency: 0,
      avg_uptime: 0,
      total_capabilities: [],
      regional_distribution: {},
      performance_tiers: {
        high: 0,
        medium: 0,
        low: 0
      }
    }
  }

  const avgLatency = instances.reduce((sum, i) => sum + i.performance_metrics.latency_ms, 0) / instances.length
  const avgUptime = instances.reduce((sum, i) => sum + i.performance_metrics.uptime_percentage, 0) / instances.length
  
  const allCapabilities = instances.flatMap(i => i.capabilities)
  const totalCapabilities = [...new Set(allCapabilities)]
  
  const regionalDistribution = instances.reduce((acc, i) => {
    acc[i.region] = (acc[i.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const performanceTiers = {
    high: instances.filter(i => calculateInstanceScore(i) >= 80).length,
    medium: instances.filter(i => calculateInstanceScore(i) >= 60 && calculateInstanceScore(i) < 80).length,
    low: instances.filter(i => calculateInstanceScore(i) < 60).length
  }

  return {
    total_instances: instances.length,
    online_instances: instances.filter(i => i.status === 'online').length,
    avg_latency: avgLatency,
    avg_uptime: avgUptime,
    total_capabilities: totalCapabilities,
    regional_distribution: regionalDistribution,
    performance_tiers: performanceTiers
  }
}
