// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// services/router.ts

import PetalsProvider from '../providers/petals'
import WondercraftProvider from '../providers/wondercraft'
import TinygradProvider from '../providers/tinygrad'

export interface ProviderRequest {
  prompt: string
  model?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface ProviderResponse {
  text: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latency: number
  provider: string
}

export interface ProviderHealth {
  provider: string
  healthy: boolean
  latency: number
  lastCheck: Date
}

export class ProviderRouter {
  private providers: Map<string, any> = new Map()
  private healthCache: Map<string, ProviderHealth> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    // Initialize providers
    this.providers.set('petals', new PetalsProvider())
    this.providers.set('wondercraft', new WondercraftProvider())
    this.providers.set('tinygrad', new TinygradProvider())
    
    // Start health monitoring
    this.startHealthMonitoring()
  }

  private async startHealthMonitoring() {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.updateProviderHealth()
    }, 30000)
    
    // Initial health check
    await this.updateProviderHealth()
  }

  private async updateProviderHealth() {
    const healthPromises = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      const startTime = Date.now()
      try {
        const healthy = await provider.healthCheck()
        const latency = Date.now() - startTime
        
        this.healthCache.set(name, {
          provider: name,
          healthy,
          latency,
          lastCheck: new Date()
        })
      } catch (error) {
        this.healthCache.set(name, {
          provider: name,
          healthy: false,
          latency: -1,
          lastCheck: new Date()
        })
      }
    })

    await Promise.all(healthPromises)
  }

  async getHealthyProviders(): Promise<string[]> {
    const healthy: string[] = []
    
    for (const [name, health] of this.healthCache.entries()) {
      if (health.healthy && health.latency > 0) {
        healthy.push(name)
      }
    }
    
    return healthy.sort((a, b) => {
      const healthA = this.healthCache.get(a)!
      const healthB = this.healthCache.get(b)!
      return healthA.latency - healthB.latency
    })
  }

  async routeRequest(request: ProviderRequest): Promise<ProviderResponse> {
    const healthyProviders = await this.getHealthyProviders()
    
    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available')
    }

    // Select first healthy provider (fastest based on health check)
    const selectedProvider = healthyProviders[0]
    const provider = this.providers.get(selectedProvider)
    
    if (!provider) {
      throw new Error(`Provider ${selectedProvider} not found`)
    }

    try {
      const response = await provider.generateText(request)
      return response
    } catch (error) {
      // If first provider fails, try others
      for (const providerName of healthyProviders.slice(1)) {
        try {
          const provider = this.providers.get(providerName)
          if (provider) {
            const response = await provider.generateText(request)
            return response
          }
        } catch (fallbackError) {
          console.warn(`Provider ${providerName} fallback failed:`, fallbackError)
        }
      }
      
      throw new Error(`All providers failed: ${(error as Error).message}`)
    }
  }

  async executeQuery(query: string, maxTokens: number = 1024): Promise<{
    response: string
    routing: { provider: string; latency: number }
    telemetry: { timestamp: string; success: boolean }
  }> {
    const healthyProviders = await this.getHealthyProviders()
    
    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available')
    }
    
    const startTime = Date.now()
    let selectedProvider = 'unknown'
    
    try {
      const provider = this.providers.get(healthyProviders[0])
      if (provider) {
        selectedProvider = healthyProviders[0]
        const response = await provider.generateText({
          prompt: query,
          maxTokens,
          temperature: 0.7
        })
        
        const latency = Date.now() - startTime
        
        return {
          response: response.text || 'No response generated',
          routing: {
            provider: selectedProvider,
            latency
          },
          telemetry: {
            timestamp: new Date().toISOString(),
            success: true
          }
        }
      }
    } catch (error) {
      // If first provider fails, try others
      for (const providerName of healthyProviders.slice(1)) {
        try {
          const provider = this.providers.get(providerName)
          if (provider) {
            selectedProvider = providerName
            const response = await provider.generateText({
              prompt: query,
              maxTokens,
              temperature: 0.7
            })
            
            const latency = Date.now() - startTime
            
            return {
              response: response.text || 'No response generated',
              routing: {
                provider: selectedProvider,
                latency
              },
              telemetry: {
                timestamp: new Date().toISOString(),
                success: true
              }
            }
          }
        } catch (fallbackError) {
          console.warn(`Provider ${providerName} fallback failed:`, fallbackError)
        }
      }
      
      throw new Error(`All providers failed: ${(error as Error).message}`)
    }
    
    throw new Error('No providers available')
  }

  async streamRequest(request: ProviderRequest): Promise<ReadableStream<string>> {
    const healthyProviders = await this.getHealthyProviders()
    
    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available')
    }

    // Select first healthy provider
    const selectedProvider = healthyProviders[0]
    const provider = this.providers.get(selectedProvider)
    
    if (!provider) {
      throw new Error(`Provider ${selectedProvider} not found`)
    }

    try {
      return await provider.streamText(request)
    } catch (error) {
      // If first provider fails, try others
      for (const providerName of healthyProviders.slice(1)) {
        try {
          const provider = this.providers.get(providerName)
          if (provider) {
            return await provider.streamText(request)
          }
        } catch (fallbackError) {
          console.warn(`Provider ${providerName} fallback failed:`, fallbackError)
        }
      }
      
      throw new Error(`All providers failed: ${(error as Error).message}`)
    }
  }

  getProviderHealth(): ProviderHealth[] {
    return Array.from(this.healthCache.values())
  }

  async forceHealthCheck(): Promise<void> {
    await this.updateProviderHealth()
  }

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

// Enhanced router with additional features
export class EnhancedProviderRouter extends ProviderRouter {
  private requestHistory: Array<{
    timestamp: Date
    provider: string
    prompt: string
    latency: number
    success: boolean
  }> = []

  async routeRequest(request: ProviderRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    let success = false
    let selectedProvider = 'unknown'
    
    try {
      const response = await super.routeRequest(request)
      success = true
      selectedProvider = response.provider
      
      // Log successful request
      this.requestHistory.push({
        timestamp: new Date(),
        provider: selectedProvider,
        prompt: request.prompt.substring(0, 100) + '...',
        latency: Date.now() - startTime,
        success: true
      })
      
      return response
    } catch (error) {
      // Log failed request
      this.requestHistory.push({
        timestamp: new Date(),
        provider: selectedProvider,
        prompt: request.prompt.substring(0, 100) + '...',
        latency: Date.now() - startTime,
        success: false
      })
      
      throw error
    }
  }

  getRequestHistory(limit: number = 100) {
    return this.requestHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getProviderStats() {
    const stats = new Map<string, { requests: number; success: number; avgLatency: number }>()
    
    for (const request of this.requestHistory) {
      const current = stats.get(request.provider) || { requests: 0, success: 0, avgLatency: 0 }
      current.requests++
      if (request.success) current.success++
      current.avgLatency = (current.avgLatency * (current.requests - 1) + request.latency) / current.requests
      stats.set(request.provider, current)
    }
    
    return stats
  }
}

// Create and export a default instance
const providerRouter = new EnhancedProviderRouter()
export default providerRouter
export { providerRouter }
