// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// providers/petals.ts

export interface PetalsRequest {
  prompt: string
  model?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface PetalsResponse {
  text: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latency: number
  provider: 'petals'
}

export class PetalsProvider {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseUrl = process.env.PETALS_API_URL || 'http://localhost:8000'
    this.apiKey = process.env.PETALS_API_KEY || ''
    this.timeout = parseInt(process.env.PETALS_TIMEOUT || '30000')
  }

  async generateText(request: PetalsRequest): Promise<PetalsResponse> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Provider': 'petals'
        },
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || 'petals-v2.0',
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          stream: request.stream || false
        }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`Petals API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const latency = Date.now() - startTime

      return {
        text: data.text || data.response || '',
        model: data.model || request.model || 'petals-v2.0',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        latency,
        provider: 'petals'
      }
    } catch (error) {
      throw new Error(`Petals provider error: ${(error as Error).message}`)
    }
  }

  async streamText(request: PetalsRequest): Promise<ReadableStream<string>> {
    const streamRequest = { ...request, stream: true }
    
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Provider': 'petals'
        },
        body: JSON.stringify({
          prompt: streamRequest.prompt,
          model: streamRequest.model || 'petals-v2.0',
          max_tokens: streamRequest.maxTokens || 1000,
          temperature: streamRequest.temperature || 0.7,
          stream: true
        }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`Petals streaming API error: ${response.status} ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      return response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TransformStream({
          transform(chunk, controller) {
            try {
              const lines = chunk.split('\n')
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    controller.terminate()
                    return
                  }
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.text) {
                      controller.enqueue(parsed.text)
                    }
                  } catch (e) {
                    // Skip malformed JSON
                  }
                }
              }
            } catch (error) {
              controller.error(error)
            }
          }
        }))
    } catch (error) {
      throw new Error(`Petals streaming error: ${(error as Error).message}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Provider': 'petals'
        },
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export default PetalsProvider
