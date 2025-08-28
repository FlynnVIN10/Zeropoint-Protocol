interface ProviderConfig {
  name: string
  baseUrl: string
  apiKey?: string
  maxTokens: number
  costPerToken: number
  latencyMs: number
  health: 'healthy' | 'degraded' | 'down'
  quota: {
    daily: number
    used: number
    resetTime: string
  }
}

interface RoutingDecision {
  provider: string
  reason: string
  estimatedCost: number
  estimatedLatency: number
  fallback?: string
}

export class ProviderRouter {
  private providers: Map<string, ProviderConfig> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeProviders()
    this.startHealthMonitoring()
  }

  private initializeProviders() {
    // Initialize with default providers
    this.providers.set('gpt-4', {
      name: 'GPT-4',
      baseUrl: 'https://api.openai.com/v1',
      maxTokens: 8192,
      costPerToken: 0.00003,
      latencyMs: 2000,
      health: 'healthy',
      quota: { daily: 1000000, used: 0, resetTime: new Date().toISOString() }
    })

    this.providers.set('claude-3', {
      name: 'Claude 3',
      baseUrl: 'https://api.anthropic.com/v1',
      maxTokens: 100000,
      costPerToken: 0.000015,
      latencyMs: 1500,
      health: 'healthy',
      quota: { daily: 500000, used: 0, resetTime: new Date().toISOString() }
    })

    this.providers.set('grok-4', {
      name: 'Grok 4',
      baseUrl: 'https://api.x.ai/v1',
      maxTokens: 128000,
      costPerToken: 0.00001,
      latencyMs: 1000,
      health: 'healthy',
      quota: { daily: 2000000, used: 0, resetTime: new Date().toISOString() }
    })

    this.providers.set('petals', {
      name: 'Petals',
      baseUrl: 'https://api.petals.ml',
      maxTokens: 2048,
      costPerToken: 0.000005,
      latencyMs: 3000,
      health: 'healthy',
      quota: { daily: 5000000, used: 0, resetTime: new Date().toISOString() }
    })

    this.providers.set('wondercraft', {
      name: 'Wondercraft',
      baseUrl: 'https://api.wondercraft.ai',
      maxTokens: 4096,
      costPerToken: 0.000008,
      latencyMs: 2500,
      health: 'healthy',
      quota: { daily: 1000000, used: 0, resetTime: new Date().toISOString() }
    })

    this.providers.set('tinygrad', {
      name: 'TinyGrad Local',
      baseUrl: 'http://localhost:8080',
      maxTokens: 1024,
      costPerToken: 0,
      latencyMs: 100,
      health: 'healthy',
      quota: { daily: 10000000, used: 0, resetTime: new Date().toISOString() }
    })
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.checkProviderHealth()
    }, 30000) // Check every 30 seconds
  }

  private async checkProviderHealth() {
    for (const [name, provider] of this.providers) {
      try {
        const start = Date.now()
        const response = await fetch(`${provider.baseUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        const latency = Date.now() - start
        
        if (response.ok) {
          provider.health = 'healthy'
          provider.latencyMs = latency
        } else {
          provider.health = 'degraded'
        }
      } catch (error) {
        provider.health = 'down'
      }
    }
  }

  public selectProvider(query: string, maxTokens: number = 1024): RoutingDecision {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.health === 'healthy' && p.maxTokens >= maxTokens)

    if (availableProviders.length === 0) {
      throw new Error('No healthy providers available')
    }

    // Score providers based on multiple factors
    const scoredProviders = availableProviders.map(provider => {
      const latencyScore = 1 / (provider.latencyMs / 1000) // Lower latency = higher score
      const costScore = 1 / (provider.costPerToken * maxTokens) // Lower cost = higher score
      const quotaScore = (provider.quota.daily - provider.quota.used) / provider.quota.daily
      
      const totalScore = latencyScore * 0.4 + costScore * 0.3 + quotaScore * 0.3
      
      return { provider, score: totalScore }
    })

    // Sort by score and select the best
    scoredProviders.sort((a, b) => b.score - a.score)
    const selected = scoredProviders[0].provider

    // Determine fallback
    const fallback = scoredProviders.length > 1 ? scoredProviders[1].provider.name : undefined

    return {
      provider: selected.name,
      reason: `Selected ${selected.name} based on latency (${selected.latencyMs}ms), cost ($${(selected.costPerToken * maxTokens).toFixed(6)}), and quota availability`,
      estimatedCost: selected.costPerToken * maxTokens,
      estimatedLatency: selected.latencyMs,
      fallback
    }
  }

  public async executeQuery(query: string, maxTokens: number = 1024): Promise<{
    response: string
    routing: RoutingDecision
    telemetry: {
      provider: string
      instance: string
      latencyMs: number
      tokensUsed: number
      cost: number
    }
  }> {
    const routing = this.selectProvider(query, maxTokens)
    const provider = this.providers.get(routing.provider.toLowerCase().replace(/\s+/g, '-'))
    
    if (!provider) {
      throw new Error(`Provider ${routing.provider} not found`)
    }

    const startTime = Date.now()
    
    try {
      // This is a placeholder - actual implementation would call the provider's API
      const response = await this.callProvider(provider, query, maxTokens)
      const latency = Date.now() - startTime
      
      return {
        response,
        routing,
        telemetry: {
          provider: provider.name,
          instance: provider.baseUrl,
          latencyMs: latency,
          tokensUsed: maxTokens,
          cost: routing.estimatedCost
        }
      }
    } catch (error) {
      // Try fallback if available
      if (routing.fallback) {
        const fallbackProvider = this.providers.get(routing.fallback.toLowerCase().replace(/\s+/g, '-'))
        if (fallbackProvider) {
          const response = await this.callProvider(fallbackProvider, query, maxTokens)
          const latency = Date.now() - startTime
          
          return {
            response,
            routing: { ...routing, provider: fallbackProvider.name },
            telemetry: {
              provider: fallbackProvider.name,
              instance: fallbackProvider.baseUrl,
              latencyMs: latency,
              tokensUsed: maxTokens,
              cost: fallbackProvider.costPerToken * maxTokens
            }
          }
        }
      }
      
      throw error
    }
  }

  private async callProvider(provider: ProviderConfig, query: string, maxTokens: number): Promise<string> {
    // This is a placeholder implementation
    // In production, this would make actual API calls to the selected provider
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, provider.latencyMs))
    
    // Return mock response for now
    return `Response from ${provider.name}: This is a placeholder response to "${query}". In production, this would be the actual AI response from ${provider.name}.`
  }

  public getProviderStatus(): Record<string, any> {
    const status: Record<string, any> = {}
    
    for (const [name, provider] of this.providers) {
      status[name] = {
        health: provider.health,
        latencyMs: provider.latencyMs,
        quotaUsed: provider.quota.used,
        quotaRemaining: provider.quota.daily - provider.quota.used,
        lastCheck: new Date().toISOString()
      }
    }
    
    return status
  }

  public cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
  }
}

// Export singleton instance
export const providerRouter = new ProviderRouter()

// Export types for external use
export type { ProviderConfig, RoutingDecision }
