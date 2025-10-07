interface ClaudeResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
  stop_sequence: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class ClaudeProvider {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.anthropic.com/v1'
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
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
      }

      const data: ClaudeResponse = await response.json()
      const latency = Date.now() - startTime

      return {
        response: data.content[0]?.text || 'No response content',
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
        latencyMs: latency,
        model: data.model
      }
    } catch (error) {
      throw new Error(`Claude provider error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}
