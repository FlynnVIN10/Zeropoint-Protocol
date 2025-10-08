import { ProviderRouter } from './router'

interface EnhancedRoutingMetrics {
  provider: string
  instance_id: string
  latency_ms: number
  cost_per_token: number
  quality_score: number
  availability: number
  consensus_rating: number
  regional_performance: number
}

interface NetworkAwareRouting {
  local_instances: string[]
  regional_instances: string[]
  global_instances: string[]
  routing_strategy: 'performance' | 'cost' | 'quality' | 'consensus' | 'hybrid'
}

export class EnhancedProviderRouter extends ProviderRouter {
  private networkMetrics: Map<string, EnhancedRoutingMetrics> = new Map()
  private networkInstances: Map<string, any> = new Map()
  private routingHistory: any[] = []

  constructor() {
    super()
    this.initializeNetworkMetrics()
  }

  private initializeNetworkMetrics() {
    // Initialize with default metrics for known providers
    const defaultMetrics: EnhancedRoutingMetrics[] = [
      {
        provider: 'gpt-4',
        instance_id: 'openai-global',
        latency_ms: 150,
        cost_per_token: 0.03,
        quality_score: 95,
        availability: 99.9,
        consensus_rating: 92,
        regional_performance: 90
      },
      {
        provider: 'claude-3',
        instance_id: 'anthropic-global',
        latency_ms: 180,
        cost_per_token: 0.025,
        quality_score: 93,
        availability: 99.8,
        consensus_rating: 89,
        regional_performance: 88
      },
      {
        provider: 'grok-4',
        instance_id: 'xai-global',
        latency_ms: 120,
        cost_per_token: 0.02,
        quality_score: 88,
        availability: 99.5,
        consensus_rating: 85,
        regional_performance: 85
      },
      {
        provider: 'petals',
        instance_id: 'petals-distributed',
        latency_ms: 300,
        cost_per_token: 0.01,
        quality_score: 82,
        availability: 98.0,
        consensus_rating: 78,
        regional_performance: 75
      },
      {
        provider: 'wondercraft',
        instance_id: 'wondercraft-local',
        latency_ms: 50,
        cost_per_token: 0.005,
        quality_score: 85,
        availability: 99.0,
        consensus_rating: 80,
        regional_performance: 95
      },
      {
        provider: 'tinygrad',
        instance_id: 'tinygrad-local',
        latency_ms: 25,
        cost_per_token: 0.001,
        quality_score: 75,
        availability: 95.0,
        consensus_rating: 70,
        regional_performance: 98
      }
    ]

    defaultMetrics.forEach(metrics => {
      this.networkMetrics.set(metrics.provider, metrics)
    })
  }

  async selectEnhancedProvider(
    query: string,
    maxTokens: number,
    strategy: 'performance' | 'cost' | 'quality' | 'consensus' | 'hybrid' = 'hybrid',
    userPreferences?: {
      maxLatency?: number
      maxCost?: number
      minQuality?: number
      preferredRegion?: string
    }
  ): Promise<{
    provider: string
    instance_id: string
    reason: string
    metrics: EnhancedRoutingMetrics
    confidence: number
  }> {
    const availableProviders = Array.from(this.networkMetrics.values())
      .filter(metrics => metrics.availability > 95) // Only consider highly available providers

    if (availableProviders.length === 0) {
      throw new Error('No available providers meeting availability requirements')
    }

    // Apply user preferences as filters
    let filteredProviders = availableProviders
    if (userPreferences?.maxLatency) {
      filteredProviders = filteredProviders.filter(p => p.latency_ms <= userPreferences.maxLatency!)
    }
    if (userPreferences?.maxCost) {
      filteredProviders = filteredProviders.filter(p => p.cost_per_token <= userPreferences.maxCost!)
    }
    if (userPreferences?.minQuality) {
      filteredProviders = filteredProviders.filter(p => p.quality_score >= userPreferences.minQuality!)
    }

    if (filteredProviders.length === 0) {
      throw new Error('No providers meet the specified user preferences')
    }

    // Calculate scores based on strategy
    const scoredProviders = filteredProviders.map(provider => {
      const score = this.calculateProviderScore(provider, strategy, userPreferences)
      return { provider, score }
    })

    // Sort by score and select the best
    scoredProviders.sort((a, b) => b.score - a.score)
    const selected = scoredProviders[0]

    // Calculate confidence based on score distribution
    const confidence = this.calculateConfidence(scoredProviders, selected.score)

    // Record routing decision
    this.recordRoutingDecision(query, selected.provider, strategy, confidence)

    return {
      provider: selected.provider.provider,
      instance_id: selected.provider.instance_id,
      reason: this.generateRoutingReason(selected.provider, strategy),
      metrics: selected.provider,
      confidence
    }
  }

  private calculateProviderScore(
    provider: EnhancedRoutingMetrics,
    strategy: string,
    userPreferences?: any
  ): number {
    let score = 0
    const weights = this.getStrategyWeights(strategy)

    // Performance score (lower latency = higher score)
    const latencyScore = Math.max(0, 100 - (provider.latency_ms / 10))
    score += latencyScore * weights.performance

    // Cost score (lower cost = higher score)
    const costScore = Math.max(0, 100 - (provider.cost_per_token * 1000))
    score += costScore * weights.cost

    // Quality score
    score += provider.quality_score * weights.quality

    // Consensus rating
    score += provider.consensus_rating * weights.consensus

    // Regional performance bonus
    if (userPreferences?.preferredRegion && provider.instance_id.includes(userPreferences.preferredRegion)) {
      score += 20
    }

    // Availability bonus
    score += (provider.availability - 95) * 2

    return Math.max(0, Math.min(100, score))
  }

  private getStrategyWeights(strategy: string) {
    switch (strategy) {
      case 'performance':
        return { performance: 0.4, cost: 0.1, quality: 0.3, consensus: 0.2 }
      case 'cost':
        return { performance: 0.1, cost: 0.5, quality: 0.2, consensus: 0.2 }
      case 'quality':
        return { performance: 0.2, cost: 0.1, quality: 0.5, consensus: 0.2 }
      case 'consensus':
        return { performance: 0.2, cost: 0.1, quality: 0.2, consensus: 0.5 }
      case 'hybrid':
      default:
        return { performance: 0.25, cost: 0.25, quality: 0.25, consensus: 0.25 }
    }
  }

  private calculateConfidence(scoredProviders: any[], selectedScore: number): number {
    if (scoredProviders.length === 1) return 100

    const sortedScores = scoredProviders.map(p => p.score).sort((a, b) => b - a)
    const scoreGap = sortedScores[0] - sortedScores[1]

    // Higher confidence for larger score gaps
    if (scoreGap > 20) return 95
    if (scoreGap > 10) return 85
    if (scoreGap > 5) return 75
    return 65
  }

  private generateRoutingReason(provider: EnhancedRoutingMetrics, strategy: string): string {
    const reasons = {
      performance: `Selected ${provider.provider} for optimal performance (latency: ${provider.latency_ms}ms)`,
      cost: `Selected ${provider.provider} for cost efficiency (${provider.cost_per_token}/token)`,
      quality: `Selected ${provider.provider} for highest quality (score: ${provider.quality_score})`,
      consensus: `Selected ${provider.provider} for consensus alignment (rating: ${provider.consensus_rating})`,
      hybrid: `Selected ${provider.provider} based on balanced performance, cost, quality, and consensus metrics`
    }

    return reasons[strategy as keyof typeof reasons] || reasons.hybrid
  }

  private recordRoutingDecision(query: string, provider: EnhancedRoutingMetrics, strategy: string, confidence: number) {
    this.routingHistory.push({
      timestamp: new Date().toISOString(),
      query: query.substring(0, 100), // Truncate for privacy
      provider: provider.provider,
      instance_id: provider.instance_id,
      strategy,
      confidence,
      metrics: {
        latency: provider.latency_ms,
        cost: provider.cost_per_token,
        quality: provider.quality_score,
        consensus: provider.consensus_rating
      }
    })

    // Keep only last 1000 decisions
    if (this.routingHistory.length > 1000) {
      this.routingHistory = this.routingHistory.slice(-1000)
    }
  }

  async getRoutingAnalytics(): Promise<{
    total_decisions: number
    strategy_distribution: Record<string, number>
    provider_performance: Record<string, any>
    confidence_trends: any[]
    recent_decisions: any[]
  }> {
    const totalDecisions = this.routingHistory.length
    const strategyDistribution = this.routingHistory.reduce((acc, decision) => {
      acc[decision.strategy] = (acc[decision.strategy] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const providerPerformance = Array.from(this.networkMetrics.values()).map(provider => ({
      provider: provider.provider,
      total_routes: this.routingHistory.filter(d => d.provider === provider.provider).length,
      avg_confidence: this.routingHistory
        .filter(d => d.provider === provider.provider)
        .reduce((sum, d) => sum + d.confidence, 0) / 
        Math.max(1, this.routingHistory.filter(d => d.provider === provider.provider).length),
      metrics: provider
    }))

    const confidenceTrends = this.routingHistory
      .slice(-100)
      .map((decision, index) => ({
        decision: index + 1,
        confidence: decision.confidence,
        timestamp: decision.timestamp
      }))

    return {
      total_decisions: totalDecisions,
      strategy_distribution: strategyDistribution,
      provider_performance: providerPerformance,
      confidence_trends: confidenceTrends,
      recent_decisions: this.routingHistory.slice(-10)
    }
  }

  async updateNetworkMetrics(provider: string, metrics: Partial<EnhancedRoutingMetrics>): Promise<void> {
    const existing = this.networkMetrics.get(provider)
    if (existing) {
      this.networkMetrics.set(provider, { ...existing, ...metrics })
    }
  }

  async registerNetworkInstance(instance: any): Promise<void> {
    this.networkInstances.set(instance.instance_id, instance)
  }
}
