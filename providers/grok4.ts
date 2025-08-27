interface Grok4Response {
  id: string
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class Grok4Provider {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(apiKey: string, model: string = 'grok-beta') {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.x.ai/v1'
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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Grok4 API error: ${response.status} ${response.statusText}`)
      }

      const data: Grok4Response = await response.json()
      const latency = Date.now() - startTime

      return {
        response: data.choices[0]?.message?.content || 'No response content',
        tokensUsed: data.usage.total_tokens,
        latencyMs: latency,
        model: data.model
      }
    } catch (error) {
      throw new Error(`Grok4 provider error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}
