import { Controller, Get, Post, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator.js';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

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

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Send a welcome message after 2 seconds
    setTimeout(() => {
      res.write(`data: ${JSON.stringify({ 
        type: 'message', 
        content: 'Welcome to Zeropoint Protocol! I am a Synthiant agent ready to assist you with questions about our ethical AI framework, consensus mechanisms, or any other aspects of the protocol.',
        timestamp: new Date().toISOString()
      })}\n\n`);
    }, 2000);

    // Keep connection alive with periodic pings
    const pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);

    // Handle client disconnect
    res.on('close', () => {
      clearInterval(pingInterval);
      this.logger.log('Chat stream disconnected');
    });
  }

  @Post('send')
  @Public()
  async sendMessage(@Body() body: { message: string }) {
    try {
      this.logger.log(`Received chat message: ${body.message}`);

      // Simple response logic - in production this would integrate with AI models
      let response = 'Thank you for your message. I am currently in development mode.';
      
      const message = body.message.toLowerCase();
      
      if (message.includes('hello') || message.includes('hi')) {
        response = 'Hello! I am a Synthiant agent from the Zeropoint Protocol. How can I assist you today?';
      } else if (message.includes('consensus')) {
        response = 'The Zeropoint Protocol uses a multi-agent consensus mechanism with ethical AI gates. Our consensus ensures all operations align with our ethical framework before execution.';
      } else if (message.includes('ethical') || message.includes('ethics')) {
        response = 'Our ethical AI framework includes the Zeroth-gate validation system, which filters all operations through ethical constraints before execution. This ensures AI safety and alignment.';
      } else if (message.includes('synthiant')) {
        response = 'Synthiants are our AI agents that operate within the Zeropoint Protocol. They are designed with ethical constraints and participate in consensus mechanisms to ensure safe AI operations.';
      } else if (message.includes('help')) {
        response = 'I can help you learn about the Zeropoint Protocol, our consensus mechanisms, ethical AI framework, and Synthiant agents. What would you like to know more about?';
      }

      return {
        success: true,
        message: response,
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
} 