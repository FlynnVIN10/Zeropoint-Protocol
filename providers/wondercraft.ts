// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// providers/wondercraft.ts

export interface WondercraftRequest {
  prompt: string
  model?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface WondercraftResponse {
  text: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latency: number
  provider: 'wondercraft'
}

export class WondercraftProvider {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor() {
    this.baseUrl = process.env.WONDERCRAFT_API_URL || 'http://localhost:8001'
    this.apiKey = process.env.WONDERCRAFT_API_KEY || ''
    this.timeout = parseInt(process.env.WONDERCRAFT_TIMEOUT || '30000')
  }

  async generateText(request: WondercraftRequest): Promise<WondercraftResponse> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Provider': 'wondercraft'
        },
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || 'wondercraft-v1.0',
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          stream: request.stream || false
        }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`Wondercraft API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const latency = Date.now() - startTime

      return {
        text: data.text || data.response || '',
        model: data.model || request.model || 'wondercraft-v1.0',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        latency,
        provider: 'wondercraft'
      }
    } catch (error) {
      throw new Error(`Wondercraft provider error: ${(error as Error).message}`)
    }
  }

  async streamText(request: WondercraftRequest): Promise<ReadableStream<string>> {
    const streamRequest = { ...request, stream: true }
    
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Provider': 'wondercraft'
        },
        body: JSON.stringify({
          prompt: streamRequest.prompt,
          model: streamRequest.model || 'wondercraft-v1.0',
          max_tokens: streamRequest.maxTokens || 1000,
          temperature: streamRequest.temperature || 0.7,
          stream: true
        }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`Wondercraft streaming API error: ${response.status} ${response.statusText}`)
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
      throw new Error(`Wondercraft streaming error: ${(error as Error).message}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Provider': 'wondercraft'
        },
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export default WondercraftProvider
