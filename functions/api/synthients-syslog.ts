export const onRequest = async ({ request }) => {
  const url = new URL(request.url)
  const format = url.searchParams.get('format') || 'json'
  
  const logs = [
    {
      id: "log-001",
      timestamp: new Date().toISOString(),
      synthient_id: "petals:alpha",
      synthient_type: "petals",
      action: "proposal_generated",
      status: "success",
      details: {
        proposal_id: "prop_20250911_003",
        title: "Memory Optimization for Training Pipeline",
        impact: "high"
      },
      severity: "medium"
    },
    {
      id: "log-002", 
      timestamp: new Date(Date.now() - 30000).toISOString(),
      synthient_id: "wondercraft:beta",
      synthient_type: "wondercraft", 
      action: "asset_contribution",
      status: "success",
      details: {
        contribution_id: "contrib_20250911_002",
        asset_type: "code_optimization",
        lines_changed: 15
      },
      severity: "low"
    },
    {
      id: "log-003",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      synthient_id: "tinygrad:gamma",
      synthient_type: "tinygrad",
      action: "training_epoch_completed", 
      status: "success",
      details: {
        job_id: "job_001",
        epoch: 16,
        loss: 0.198,
        accuracy: 0.912
      },
      severity: "low"
    },
    {
      id: "log-004",
      timestamp: new Date(Date.now() - 90000).toISOString(),
      synthient_id: "consensus:delta",
      synthient_type: "consensus",
      action: "proposal_vote_cast",
      status: "success",
      details: {
        proposal_id: "prop_20250911_001",
        vote: "approve",
        rationale: "Enhanced training pipeline will improve system performance"
      },
      severity: "medium"
    },
    {
      id: "log-005",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      synthient_id: "training:epsilon",
      synthient_type: "training",
      action: "self_improvement_analysis",
      status: "success",
      details: {
        analysis_type: "performance_optimization",
        target_metrics: ["response_time", "memory_usage"],
        current_performance: {
          response_time_ms: 245,
          memory_usage_mb: 156.3
        }
      },
      severity: "medium"
    }
  ]

  if (format === 'syslog') {
    // Return in traditional syslog format
    const syslogEntries = logs.map(log => {
      const priority = log.severity === 'critical' ? 0 : 
                      log.severity === 'high' ? 1 :
                      log.severity === 'medium' ? 2 : 3
      const facility = 16 // local0
      const priorityCode = facility * 8 + priority
      
      const timestamp = new Date(log.timestamp).toISOString().replace('T', ' ').replace('Z', '')
      const message = `${log.action} - ${JSON.stringify(log.details)}`
      
      return `<${priorityCode}>${timestamp} zeropoint-protocol ${log.synthient_id}[${log.id}]: ${message}`
    }).join('\n')

    return new Response(syslogEntries, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }

  // Return JSON format
  return new Response(JSON.stringify({
    total_entries: logs.length,
    total_available: logs.length,
    generated_at: new Date().toISOString(),
    logs: logs
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
