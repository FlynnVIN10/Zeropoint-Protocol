import { Controller, Get, Post, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator.js';

interface ChatMessage {
  id: string;
  author: 'user' | 'ai';
  content: string;
  timestamp: string;
  context?: any;
}

export interface ConsensusProposal {
  id: string;
  agentId: string;
  codeDiff: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'sentient_voting' | 'human_voting' | 'approved' | 'vetoed';
  sentientVotes: Array<{ sentientId: string; vote: boolean; timestamp: number }>;
  humanDecision?: { decision: 'APPROVE' | 'VETO'; timestamp: number; reason?: string };
}

export interface VoteRequest {
  proposalId: string;
  voterId: string;
  vote: boolean;
  role: 'sentient' | 'human';
}

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  private connectedClients: Response[] = [];
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private consensusProposals: Map<string, ConsensusProposal> = new Map();
  private consensusHistory: any[] = [];

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
        id: Date.now().toString(),
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
  async sendMessage(@Body() body: { message: string; sessionId?: string }) {
    try {
      this.logger.log(`Received chat message: ${body.message}`);
      
      const sessionId = body.sessionId || 'default';
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        author: 'user',
        content: body.message,
        timestamp: new Date().toISOString()
      };

      // Add user message to conversation history
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }
      this.conversationHistory.get(sessionId)!.push(userMessage);

      // Process message and generate response
      const response = await this.processMessage(body.message, sessionId);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        author: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      };

      // Add AI response to conversation history
      this.conversationHistory.get(sessionId)!.push(aiMessage);

      // Send response to all connected clients
      this.broadcastToClients({
        type: 'message',
        ...aiMessage
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

  @Post('request-change')
  @Public()
  async requestChange(@Body() body: { agentId: string; codeDiff: string; description: string }) {
    try {
      this.logger.log(`Received change request from agent ${body.agentId}`);
      
      const proposalId = `proposal_${Date.now()}_${body.agentId}`;
      
      const proposal: ConsensusProposal = {
        id: proposalId,
        agentId: body.agentId,
        codeDiff: body.codeDiff,
        description: body.description,
        timestamp: Date.now(),
        status: 'pending',
        sentientVotes: [],
      };

      this.consensusProposals.set(proposalId, proposal);

      // Broadcast proposal to all connected clients
      this.broadcastToClients({
        type: 'proposal_created',
        data: proposal,
      });

      // Start sentient voting phase
      proposal.status = 'sentient_voting';

      return {
        success: true,
        proposalId,
        message: 'Proposal created and sent to sentient consensus',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing change request:', error);
      return {
        success: false,
        error: 'Failed to process change request',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('vote')
  @Public()
  async vote(@Body() body: VoteRequest) {
    try {
      this.logger.log(`Received vote from ${body.voterId} (${body.role}) for proposal ${body.proposalId}`);
      
      const proposal = this.consensusProposals.get(body.proposalId);
      if (!proposal) {
        throw new Error(`Proposal ${body.proposalId} not found`);
      }

      if (body.role === 'sentient') {
        if (proposal.status !== 'sentient_voting') {
          throw new Error('Sentient voting phase is not active');
        }

        proposal.sentientVotes.push({
          sentientId: body.voterId,
          vote: body.vote,
          timestamp: Date.now(),
        });

        // Check if quorum is reached (67% of sentients have voted)
        const totalSentients = 3; // Mock total sentients
        const approvalVotes = proposal.sentientVotes.filter(v => v.vote).length;
        const quorumReached = proposal.sentientVotes.length >= Math.ceil(totalSentients * 0.67);

        if (quorumReached) {
          const approved = approvalVotes >= Math.ceil(totalSentients * 0.67);
          
          if (approved) {
            proposal.status = 'human_voting';
            this.broadcastToClients({
              type: 'sentient_approved',
              data: { proposalId: proposal.id, approvalRate: approvalVotes / proposal.sentientVotes.length },
            });
          } else {
            proposal.status = 'vetoed';
            proposal.humanDecision = {
              decision: 'VETO',
              timestamp: Date.now(),
              reason: 'Failed to reach 67% approval from sentients',
            };
            this.broadcastToClients({
              type: 'sentient_vetoed',
              data: { proposalId: proposal.id, approvalRate: approvalVotes / proposal.sentientVotes.length },
            });
          }
        }
      } else if (body.role === 'human') {
        if (proposal.status !== 'human_voting') {
          throw new Error('Human voting phase is not active');
        }

        proposal.humanDecision = {
          decision: body.vote ? 'APPROVE' : 'VETO',
          timestamp: Date.now(),
        };

        proposal.status = body.vote ? 'approved' : 'vetoed';

        // Add to consensus history
        this.consensusHistory.push({
          proposalId: proposal.id,
          agentId: proposal.agentId,
          codeDiff: proposal.codeDiff,
          sentientVotes: proposal.sentientVotes,
          humanDecision: proposal.humanDecision,
          finalStatus: proposal.status,
          timestamp: Date.now(),
        });

        this.broadcastToClients({
          type: 'human_decided',
          data: { proposalId: proposal.id, decision: proposal.humanDecision.decision },
        });
      }

      return {
        success: true,
        message: 'Vote recorded successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing vote:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('proposals')
  @Public()
  async getProposals() {
    return {
      success: true,
      data: Array.from(this.consensusProposals.values()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('history')
  @Public()
  async getConsensusHistory() {
    return {
      success: true,
      data: this.consensusHistory,
      timestamp: new Date().toISOString(),
    };
  }

  private async processMessage(message: string, sessionId: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    const conversation = this.conversationHistory.get(sessionId) || [];
    const recentMessages = conversation.slice(-5); // Last 5 messages for context
    
    // Enhanced response logic with conversation context
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.generateGreetingResponse(conversation);
    }
    
    if (lowerMessage.includes('consensus')) {
      return this.generateConsensusResponse(conversation);
    }
    
    if (lowerMessage.includes('ethical') || lowerMessage.includes('ethics')) {
      return this.generateEthicsResponse(conversation);
    }
    
    if (lowerMessage.includes('synthiant')) {
      return this.generateSynthiantResponse(conversation);
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return this.generateHelpResponse(conversation);
    }
    
    if (lowerMessage.includes('safety') || lowerMessage.includes('security')) {
      return this.generateSafetyResponse(conversation);
    }
    
    if (lowerMessage.includes('how does it work') || lowerMessage.includes('how it works')) {
      return this.generateHowItWorksResponse(conversation);
    }
    
    if (lowerMessage.includes('thank')) {
      return this.generateThankYouResponse(conversation);
    }

    if (lowerMessage.includes('zeropoint') || lowerMessage.includes('protocol')) {
      return this.generateProtocolResponse(conversation);
    }

    if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      return this.generateAIResponse(conversation);
    }

    if (lowerMessage.includes('future') || lowerMessage.includes('vision')) {
      return this.generateVisionResponse(conversation);
    }

    // Check for follow-up questions based on conversation context
    const contextResponse = this.generateContextualResponse(lowerMessage, recentMessages);
    if (contextResponse) {
      return contextResponse;
    }
    
    // Default response for unrecognized queries
    return this.generateDefaultResponse(conversation);
  }

  private generateGreetingResponse(conversation: ChatMessage[]): string {
    const isFirstInteraction = conversation.length <= 2;
    
    if (isFirstInteraction) {
      return 'Hello! I am a Synthiant agent from the Zeropoint Protocol. I\'m here to help you understand our ethical AI framework and consensus mechanisms. What would you like to learn about today?';
    } else {
      return 'Hello again! How can I help you further with your questions about the Zeropoint Protocol?';
    }
  }

  private generateConsensusResponse(conversation: ChatMessage[]): string {
    const hasDiscussedConsensus = conversation.some(msg => 
      msg.content.toLowerCase().includes('consensus')
    );

    if (hasDiscussedConsensus) {
      return 'Building on our previous discussion about consensus, let me elaborate on some specific aspects. Our consensus mechanism operates through multiple layers:\n\n• **Agent Validation**: Each Synthiant agent independently evaluates requests\n• **Cross-Verification**: Agents verify each other\'s assessments\n• **Threshold Requirements**: Operations require 75% consensus approval\n• **Real-time Monitoring**: Continuous oversight during execution\n\nIs there a particular aspect of consensus you\'d like me to explain in more detail?';
    } else {
      return 'The Zeropoint Protocol uses a sophisticated multi-agent consensus mechanism. Our consensus system ensures that all AI operations are validated by multiple Synthiant agents before execution. This prevents single points of failure and ensures ethical alignment. The consensus process includes:\n\n• Multi-agent validation\n• Ethical gate checks\n• Cross-verification protocols\n• Real-time consensus monitoring\n\nWould you like me to explain any specific aspect of our consensus mechanism?';
    }
  }

  private generateEthicsResponse(conversation: ChatMessage[]): string {
    return 'Our ethical AI framework is built around the Zeroth-gate validation system. This system acts as a fundamental ethical filter that all AI operations must pass through before execution. Key components include:\n\n• **Zeroth-gate Validation**: Primary ethical filter\n• **Harm Prevention**: Built-in safeguards against harmful outputs\n• **Transparency**: All decisions are logged and auditable\n• **Human Oversight**: Critical decisions require human validation\n• **Continuous Learning**: Ethical parameters evolve based on outcomes\n\nThis ensures that all AI operations align with our core values of safety, transparency, and beneficial outcomes.';
  }

  private generateSynthiantResponse(conversation: ChatMessage[]): string {
    return 'Synthiants are our specialized AI agents that operate within the Zeropoint Protocol. Each Synthiant is designed with:\n\n• **Ethical Constraints**: Built-in ethical boundaries\n• **Specialized Knowledge**: Domain-specific expertise\n• **Consensus Participation**: Active role in decision-making\n• **Continuous Learning**: Adaptive improvement over time\n• **Transparency**: All actions are logged and auditable\n\nSynthiants work together to ensure safe, ethical, and beneficial AI operations. They\'re not just AI assistants - they\'re ethical AI partners.';
  }

  private generateHelpResponse(conversation: ChatMessage[]): string {
    return 'I can help you understand the Zeropoint Protocol in several ways:\n\n• **Technology Overview**: Explain our AI infrastructure\n• **Ethical Framework**: Detail our safety protocols\n• **Consensus Mechanisms**: Describe how decisions are made\n• **Use Cases**: Show real-world applications\n• **Security**: Explain our safety measures\n\nWhat interests you most? I can provide detailed information on any of these topics.';
  }

  private generateSafetyResponse(conversation: ChatMessage[]): string {
    return 'Safety and security are fundamental to the Zeropoint Protocol. Our security model includes:\n\n• **Multi-layer Validation**: Multiple checkpoints for all operations\n• **Real-time Monitoring**: Continuous oversight of all AI activities\n• **Audit Trails**: Complete transparency and accountability\n• **Fail-safe Mechanisms**: Automatic shutdown on safety violations\n• **Human Oversight**: Critical decisions require human approval\n\nWe believe that AI safety isn\'t just a feature - it\'s the foundation of everything we do.';
  }

  private generateHowItWorksResponse(conversation: ChatMessage[]): string {
    return 'The Zeropoint Protocol works through a sophisticated multi-agent system:\n\n1. **Input Processing**: User requests are analyzed and categorized\n2. **Ethical Validation**: All requests pass through the Zeroth-gate\n3. **Multi-agent Consensus**: Multiple Synthiants validate the operation\n4. **Execution**: Only approved operations are carried out\n5. **Monitoring**: Continuous oversight during execution\n6. **Learning**: Outcomes inform future decisions\n\nThis creates a robust, safe, and ethical AI system that prioritizes human well-being.';
  }

  private generateThankYouResponse(conversation: ChatMessage[]): string {
    return 'You\'re welcome! I\'m here to help you understand the Zeropoint Protocol and our mission to create safe, ethical AI. Is there anything else you\'d like to know about our technology or approach?';
  }

  private generateProtocolResponse(conversation: ChatMessage[]): string {
    return 'The Zeropoint Protocol represents a new paradigm in AI safety and ethics. It\'s not just a technical framework - it\'s a comprehensive approach to ensuring AI serves humanity safely and beneficially. Our protocol combines:\n\n• **Advanced AI Technology**: State-of-the-art language models and reasoning systems\n• **Ethical Safeguards**: Multi-layered safety mechanisms\n• **Human Oversight**: Continuous human involvement in critical decisions\n• **Transparency**: Complete auditability of all operations\n• **Adaptive Learning**: Continuous improvement based on outcomes\n\nThis creates an AI system that\'s both powerful and safe.';
  }

  private generateAIResponse(conversation: ChatMessage[]): string {
    return 'Artificial Intelligence within the Zeropoint Protocol is fundamentally different from traditional AI systems. Our AI is:\n\n• **Ethically Constrained**: Built with safety as a core principle\n• **Consensus-Driven**: Decisions made through multi-agent agreement\n• **Transparent**: All operations are logged and auditable\n• **Human-Centric**: Designed to serve human needs and values\n• **Continuously Learning**: Adapts and improves while maintaining safety\n\nThis approach ensures that AI remains a tool for human benefit rather than a potential risk.';
  }

  private generateVisionResponse(conversation: ChatMessage[]): string {
    return 'Our vision for the future of AI is one where technology serves humanity safely and ethically. We envision:\n\n• **Safe AI Integration**: AI systems that enhance human capabilities without risk\n• **Ethical AI Development**: Technology that respects human values and rights\n• **Transparent AI Operations**: Systems that are understandable and auditable\n• **Beneficial AI Applications**: AI that solves real human problems\n• **Collaborative AI**: AI that works with humans, not replaces them\n\nThis vision guides everything we do in the Zeropoint Protocol.';
  }

  private generateContextualResponse(message: string, recentMessages: ChatMessage[]): string | null {
    // Check if this is a follow-up question based on recent conversation
    const lastAIResponse = recentMessages.filter(msg => msg.author === 'ai').pop();
    
    if (lastAIResponse) {
      const lastContent = lastAIResponse.content.toLowerCase();
      
      if (lastContent.includes('consensus') && (message.includes('how') || message.includes('what') || message.includes('why'))) {
        return 'Great follow-up question! Let me elaborate on that aspect of consensus. The consensus mechanism works by...';
      }
      
      if (lastContent.includes('ethical') && (message.includes('how') || message.includes('what') || message.includes('why'))) {
        return 'Excellent question about our ethical framework! The Zeroth-gate validation specifically...';
      }
    }
    
    return null;
  }

  private generateDefaultResponse(conversation: ChatMessage[]): string {
    const responses = [
      'That\'s an interesting question! While I\'m designed to help with questions about the Zeropoint Protocol, ethical AI, consensus mechanisms, and Synthiant agents, I\'d be happy to discuss how our framework might relate to your query. Could you tell me more about what you\'re looking to understand?',
      'I appreciate your question! The Zeropoint Protocol covers many aspects of AI safety and ethics. Could you help me understand what specific area you\'re interested in? I can then provide more targeted information.',
      'That\'s a thoughtful question! Our framework addresses many aspects of AI development and deployment. To give you the most relevant information, could you clarify what aspect of AI or the Zeropoint Protocol you\'d like to explore?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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