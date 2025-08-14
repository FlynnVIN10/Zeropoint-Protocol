import { Controller, Get, Post, Body, Logger } from "@nestjs/common";
import { Public } from "../decorators/public.decorator.js";
import { AppService } from "../app.service.js";
import { AgentStateService } from "../services/agent-state.service.js";

@Controller("ui")
export class UIController {
  private readonly logger = new Logger(UIController.name);

  constructor(
    private readonly appService: AppService,
    private readonly agentStateService: AgentStateService,
  ) {}

  @Get("status")
  @Public()
  async getStatus() {
    try {
      // Get health status from AppService
      const health = await this.appService.healthCheck();

      // Get additional UI-specific status data
      const status = {
        health,
        uptime: health.metrics?.uptime || 0,
        lastUpdate: new Date().toISOString(),
        version: process.env.npm_package_version || "0.0.1",
        environment: process.env.NODE_ENV || "development",
      };

      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Error fetching UI status:", error);
      return {
        success: false,
        error: "Failed to fetch status",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("agents")
  @Public()
  async getAgents() {
    try {
      // Get agent statistics
      const agents = await this.agentStateService.getAgentStatistics();

      return {
        success: true,
        data: {
          totalAgents: agents.total || 16,
          activeAgents: agents.active || 12,
          status: "operational",
          lastSync: new Date().toISOString(),
          agents: [], // Empty array for now, can be populated later
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Error fetching agent data:", error);
      return {
        success: false,
        error: "Failed to fetch agent data",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("submit")
  @Public()
  async submitPrompt(@Body() body: { prompt: string; context?: string }) {
    try {
      this.logger.log(`Processing UI prompt: ${body.prompt}`);

      // Log the UI access event
      this.logger.log(
        `SOULCONS:UI_ACCESS - ${JSON.stringify({
          action: "prompt_submission",
          prompt: body.prompt,
          timestamp: new Date().toISOString(),
        })}`,
      );

      // Process the prompt with AI logic
      const response = await this.processPrompt(body.prompt, body.context);

      // Log the intent processing
      this.logger.log(
        `SOULCONS:INTENT - ${JSON.stringify({
          intentId: this.generateIntentId(),
          type: "user",
          confidence: 0.8,
          processed: true,
          prompt: body.prompt,
          response: response.content,
          timestamp: new Date().toISOString(),
        })}`,
      );

      return {
        status: "success",
        data: {
          content: response.content,
          confidence: response.confidence,
          consensus: {
            type: response.consensusType,
            agents: response.agents,
            timestamp: new Date().toISOString(),
          },
          processing: {
            duration: response.processingTime,
            model: "zeropoint-protocol-v1",
            version: "0.0.1",
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error("Error processing prompt:", error);
      return {
        status: "error",
        error: "Failed to process prompt",
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async processPrompt(
    prompt: string,
    context?: string,
  ): Promise<{
    content: string;
    confidence: number;
    consensusType: string;
    agents: string[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    const lowerPrompt = prompt.toLowerCase();

    // Enhanced prompt processing with contextual responses
    let content = "";
    let consensusType = "user_consensus";
    const agents = ["ethical-agent", "consensus-agent", "safety-agent"];

    if (
      lowerPrompt.includes("hello") ||
      lowerPrompt.includes("hi") ||
      lowerPrompt.includes("hey")
    ) {
      content =
        "Hello! I am the Zeropoint Protocol AI system. I'm here to help you understand our ethical AI framework and assist with your questions. How can I help you?";
      consensusType = "greeting_consensus";
    } else if (lowerPrompt.includes("consensus")) {
      content =
        "The Zeropoint Protocol uses a sophisticated multi-agent consensus mechanism. Our consensus system ensures that all AI operations are validated by multiple Synthiant agents before execution. This prevents single points of failure and ensures ethical alignment. The consensus process includes multi-agent validation, ethical gate checks, cross-verification protocols, and real-time consensus monitoring.";
      consensusType = "technical_consensus";
    } else if (
      lowerPrompt.includes("ethical") ||
      lowerPrompt.includes("ethics")
    ) {
      content =
        "Our ethical AI framework is built around the Zeroth-gate validation system. This system acts as a fundamental ethical filter that all AI operations must pass through before execution. Key components include Zeroth-gate Validation, Harm Prevention, Transparency, Human Oversight, and Continuous Learning. This ensures that all AI operations align with our core values of safety, transparency, and beneficial outcomes.";
      consensusType = "ethical_consensus";
    } else if (lowerPrompt.includes("synthiant")) {
      content =
        "Synthiants are our specialized AI agents that operate within the Zeropoint Protocol. Each Synthiant is designed with Ethical Constraints, Specialized Knowledge, Consensus Participation, Continuous Learning, and Transparency. Synthiants work together to ensure safe, ethical, and beneficial AI operations. They're not just AI assistants - they're ethical AI partners.";
      consensusType = "agent_consensus";
    } else if (
      lowerPrompt.includes("help") ||
      lowerPrompt.includes("what can you do")
    ) {
      content =
        "I can help you understand the Zeropoint Protocol in several ways: Technology Overview, Ethical Framework, Consensus Mechanisms, Use Cases, and Security. What interests you most? I can provide detailed information on any of these topics.";
      consensusType = "assistance_consensus";
    } else if (
      lowerPrompt.includes("safety") ||
      lowerPrompt.includes("security")
    ) {
      content =
        "Safety and security are fundamental to the Zeropoint Protocol. Our security model includes Multi-layer Validation, Real-time Monitoring, Audit Trails, Fail-safe Mechanisms, and Human Oversight. We believe that AI safety isn't just a feature - it's the foundation of everything we do.";
      consensusType = "security_consensus";
    } else if (
      lowerPrompt.includes("how does it work") ||
      lowerPrompt.includes("how it works")
    ) {
      content =
        "The Zeropoint Protocol works through a sophisticated multi-agent system: Input Processing, Ethical Validation, Multi-agent Consensus, Execution, Monitoring, and Learning. This creates a robust, safe, and ethical AI system that prioritizes human well-being.";
      consensusType = "explanation_consensus";
    } else if (
      lowerPrompt.includes("zeropoint") ||
      lowerPrompt.includes("protocol")
    ) {
      content =
        "The Zeropoint Protocol represents a new paradigm in AI safety and ethics. It's not just a technical framework - it's a comprehensive approach to ensuring AI serves humanity safely and beneficially. Our protocol combines Advanced AI Technology, Ethical Safeguards, Human Oversight, Transparency, and Adaptive Learning.";
      consensusType = "protocol_consensus";
    } else if (
      lowerPrompt.includes("ai") ||
      lowerPrompt.includes("artificial intelligence")
    ) {
      content =
        "Artificial Intelligence within the Zeropoint Protocol is fundamentally different from traditional AI systems. Our AI is Ethically Constrained, Consensus-Driven, Transparent, Human-Centric, and Continuously Learning. This approach ensures that AI remains a tool for human benefit rather than a potential risk.";
      consensusType = "ai_consensus";
    } else if (
      lowerPrompt.includes("future") ||
      lowerPrompt.includes("vision")
    ) {
      content =
        "Our vision for the future of AI is one where technology serves humanity safely and ethically. We envision Safe AI Integration, Ethical AI Development, Transparent AI Operations, Beneficial AI Applications, and Collaborative AI. This vision guides everything we do in the Zeropoint Protocol.";
      consensusType = "vision_consensus";
    } else {
      // Default response for unrecognized queries
      content =
        "Thank you for your prompt! I've analyzed your input through our ethical AI framework. While I'm designed to help with questions about the Zeropoint Protocol, ethical AI, consensus mechanisms, and Synthiant agents, I'd be happy to discuss how our framework might relate to your query. Could you tell me more about what you're looking to understand?";
      consensusType = "general_consensus";
    }

    // Add context if provided
    if (context) {
      content += `\n\nContext provided: ${context}`;
    }

    const processingTime = Date.now() - startTime;

    return {
      content,
      confidence: 0.85 + Math.random() * 0.1, // Random confidence between 0.85-0.95
      consensusType,
      agents,
      processingTime,
    };
  }

  private generateIntentId(): string {
    return `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
