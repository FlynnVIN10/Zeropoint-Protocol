export const onRequest = async () => {
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
    }
  ]

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
