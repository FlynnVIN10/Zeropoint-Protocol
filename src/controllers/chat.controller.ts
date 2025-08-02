import { Controller, Get, Post, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator.js';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  private connectedClients: Response[] = [];

  @Get('stream')
  @Public()
  async streamChat(@Res() res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Add client to connected list
    this.connectedClients.push(res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ 
      type: 'connected', 
      message: 'Connected to Zeropoint Protocol Chat',
      timestamp: new Date().toISOString() 
    })}\n\n`);

    // Send a welcome message after 1 second
    setTimeout(() => {
      this.sendToClient(res, {
        type: 'message',
        id: Date.now(),
        author: 'ai',
        content: 'Hello! I am a Synthiant agent from the Zeropoint Protocol. I can help you learn about our ethical AI framework, consensus mechanisms, and AI safety protocols. How can I assist you today?',
        timestamp: new Date().toISOString()
      });
    }, 1000);

    // Keep connection alive with periodic pings
    const pingInterval = setInterval(() => {
      this.sendToClient(res, { 
        type: 'ping', 
        timestamp: new Date().toISOString() 
      });
    }, 30000);

    // Handle client disconnect
    res.on('close', () => {
      clearInterval(pingInterval);
      this.connectedClients = this.connectedClients.filter(client => client !== res);
      this.logger.log('Chat stream disconnected');
    });
  }

  @Post('send')
  @Public()
  async sendMessage(@Body() body: { message: string }) {
    try {
      this.logger.log(`Received chat message: ${body.message}`);

      // Process message and generate response
      const response = await this.processMessage(body.message);

      // Send response to all connected clients
      this.broadcastToClients({
        type: 'message',
        id: Date.now(),
        author: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Message processed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing chat message:', error);
      return {
        success: false,
        error: 'Failed to process message',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async processMessage(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced response logic with more detailed and contextual responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! I am a Synthiant agent from the Zeropoint Protocol. I\'m here to help you understand our ethical AI framework and consensus mechanisms. What would you like to learn about today?';
    }
    
    if (lowerMessage.includes('consensus')) {
      return 'The Zeropoint Protocol uses a sophisticated multi-agent consensus mechanism. Our consensus system ensures that all AI operations are validated by multiple Synthiant agents before execution. This prevents single points of failure and ensures ethical alignment. The consensus process includes:\n\n• Multi-agent validation\n• Ethical gate checks\n• Cross-verification protocols\n• Real-time consensus monitoring\n\nWould you like me to explain any specific aspect of our consensus mechanism?';
    }
    
    if (lowerMessage.includes('ethical') || lowerMessage.includes('ethics')) {
      return 'Our ethical AI framework is built around the Zeroth-gate validation system. This system acts as a fundamental ethical filter that all AI operations must pass through before execution. Key components include:\n\n• **Zeroth-gate Validation**: Primary ethical filter\n• **Harm Prevention**: Built-in safeguards against harmful outputs\n• **Transparency**: All decisions are logged and auditable\n• **Human Oversight**: Critical decisions require human validation\n• **Continuous Learning**: Ethical parameters evolve based on outcomes\n\nThis ensures that all AI operations align with our core values of safety, transparency, and beneficial outcomes.';
    }
    
    if (lowerMessage.includes('synthiant')) {
      return 'Synthiants are our specialized AI agents that operate within the Zeropoint Protocol. Each Synthiant is designed with:\n\n• **Ethical Constraints**: Built-in ethical boundaries\n• **Specialized Knowledge**: Domain-specific expertise\n• **Consensus Participation**: Active role in decision-making\n• **Continuous Learning**: Adaptive improvement over time\n• **Transparency**: All actions are logged and auditable\n\nSynthiants work together to ensure safe, ethical, and beneficial AI operations. They\'re not just AI assistants - they\'re ethical AI partners.';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return 'I can help you understand the Zeropoint Protocol in several ways:\n\n• **Technology Overview**: Explain our AI infrastructure\n• **Ethical Framework**: Detail our safety protocols\n• **Consensus Mechanisms**: Describe how decisions are made\n• **Use Cases**: Show real-world applications\n• **Security**: Explain our safety measures\n\nWhat interests you most? I can provide detailed information on any of these topics.';
    }
    
    if (lowerMessage.includes('safety') || lowerMessage.includes('security')) {
      return 'Safety and security are fundamental to the Zeropoint Protocol. Our security model includes:\n\n• **Multi-layer Validation**: Multiple checkpoints for all operations\n• **Real-time Monitoring**: Continuous oversight of all AI activities\n• **Audit Trails**: Complete transparency and accountability\n• **Fail-safe Mechanisms**: Automatic shutdown on safety violations\n• **Human Oversight**: Critical decisions require human approval\n\nWe believe that AI safety isn\'t just a feature - it\'s the foundation of everything we do.';
    }
    
    if (lowerMessage.includes('how does it work') || lowerMessage.includes('how it works')) {
      return 'The Zeropoint Protocol works through a sophisticated multi-agent system:\n\n1. **Input Processing**: User requests are analyzed and categorized\n2. **Ethical Validation**: All requests pass through the Zeroth-gate\n3. **Multi-agent Consensus**: Multiple Synthiants validate the operation\n4. **Execution**: Only approved operations are carried out\n5. **Monitoring**: Continuous oversight during execution\n6. **Learning**: Outcomes inform future decisions\n\nThis creates a robust, safe, and ethical AI system that prioritizes human well-being.';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! I\'m here to help you understand the Zeropoint Protocol and our mission to create safe, ethical AI. Is there anything else you\'d like to know about our technology or approach?';
    }
    
    // Default response for unrecognized queries
    return 'That\'s an interesting question! While I\'m designed to help with questions about the Zeropoint Protocol, ethical AI, consensus mechanisms, and Synthiant agents, I\'d be happy to discuss how our framework might relate to your query. Could you tell me more about what you\'re looking to understand?';
  }

  private sendToClient(client: Response, data: any) {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      this.logger.error('Error sending to client:', error);
    }
  }

  private broadcastToClients(data: any) {
    this.connectedClients.forEach(client => {
      this.sendToClient(client, data);
    });
  }
} 