import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized with API key');
    } else {
      this.logger.warn('OPENAI_API_KEY not provided, using fallback responses');
      // Create a mock OpenAI client for development
      this.openai = null;
    }
  }

  async searchContext(query: string): Promise<Array<{ title: string; content: string; relevance: number }>> {
    if (!this.openai) {
      // Return mock context for development
      return [
        {
          title: 'Zeropoint Protocol Documentation',
          content: 'The Zeropoint Protocol is an ethical AI framework that ensures AI systems operate within safe boundaries.',
          relevance: 0.95
        },
        {
          title: 'AI Safety Guidelines',
          content: 'Key principles include transparency, accountability, and human oversight in AI decision-making.',
          relevance: 0.87
        }
      ];
    }

    try {
      // Real OpenAI embedding search would go here
      this.logger.log(`Searching context for query: ${query}`);
      
      // Mock response for now
      return [
        {
          title: 'Zeropoint Protocol Documentation',
          content: 'The Zeropoint Protocol is an ethical AI framework that ensures AI systems operate within safe boundaries.',
          relevance: 0.95
        }
      ];
    } catch (error) {
      this.logger.error(`Error searching context: ${error.message}`);
      return [];
    }
  }

  async generateResponse(prompt: string, context: Array<{ title: string; content: string; relevance: number }>): Promise<string> {
    if (!this.openai) {
      // Return mock response for development
      return `Based on the Zeropoint Protocol context, I can help you with questions about ethical AI frameworks, safety guidelines, and our consensus mechanisms. What would you like to know?`;
    }

    try {
      const contextText = context.map(c => `${c.title}: ${c.content}`).join('\n');
      const fullPrompt = `Context:\n${contextText}\n\nQuestion: ${prompt}\n\nAnswer:`;
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an AI assistant for the Zeropoint Protocol, an ethical AI framework.' },
          { role: 'user', content: fullPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      this.logger.error(`Error generating response: ${error.message}`);
      return 'I apologize, but I encountered an error while processing your request.';
    }
  }
} 