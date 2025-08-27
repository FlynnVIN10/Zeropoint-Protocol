interface PetalsResponse {
  response: string
  tokens_used: number
  model: string
  latency: number
}

export class PetalsProvider {
  private baseUrl: string
  private model: string

  constructor(baseUrl: string = 'https://api.petals.ml', model: string = 'petals-team/StableBeluga2') {
    this.baseUrl = baseUrl
    this.model = model
  }

  async generateResponse(prompt: string, maxTokens: number = 1024): Promise<{
    response: string
    tokensUsed: number
    latencyMs: number
    model: string
  }> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          max_new_tokens: maxTokens,
          temperature: 0.7,
          do_sample: true
        })
      })

      if (!response.ok) {
        throw new Error(`Petals API error: ${response.status} ${response.statusText}`)
      }

      const data: PetalsResponse = await response.json()
      const latency = Date.now() - startTime

      return {
        response: data.response || 'No response content',
        tokensUsed: data.tokens_used || 0,
        latencyMs: latency,
        model: data.model || this.model
      }
    } catch (error) {
      throw new Error(`Petals provider error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET'
      })
      return response.ok
    } catch {
      return false
    }
  }
}
