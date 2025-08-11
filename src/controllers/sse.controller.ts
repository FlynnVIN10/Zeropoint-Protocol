// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get, Res, Query, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { MultiLLMService } from "../services/multi-llm.service.js";

@Controller("sse")
export class SSEController {
  constructor(
    private configService: ConfigService,
    private multiLLMService: MultiLLMService,
  ) {}

  @Get("stream")
  async streamEvents(@Res() res: Response, @Query("type") eventType?: string) {
    // Set SSE headers
    res.writeHead(HttpStatus.OK, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Send initial connection event
    res.write(
      `data: ${JSON.stringify({
        type: "connection",
        timestamp: new Date().toISOString(),
        message: "SSE connection established",
      })}\n\n`,
    );

    // Send system status event
    res.write(
      `data: ${JSON.stringify({
        type: "system_status",
        timestamp: new Date().toISOString(),
        data: {
          phase: "14.1",
          status: "healthy",
          uptime: process.uptime(),
          services: {
            database: "healthy",
            api: "healthy",
            sse: "active",
            multiLLM: "active",
          },
        },
      })}\n\n`,
    );

    // Send Multi-LLM provider status
    try {
      const providerStatus = await this.multiLLMService.getProviderStatus();
      res.write(
        `data: ${JSON.stringify({
          type: "multi_llm_status",
          timestamp: new Date().toISOString(),
          data: providerStatus,
        })}\n\n`,
      );
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: "multi_llm_status",
          timestamp: new Date().toISOString(),
          error: "Failed to fetch provider status",
        })}\n\n`,
      );
    }

    // Keep connection alive with periodic events
    const interval = setInterval(async () => {
      try {
        // Send heartbeat with updated metrics
        const metrics = this.multiLLMService.getMetrics();
        res.write(
          `data: ${JSON.stringify({
            type: "heartbeat",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            metrics: {
              totalModels: metrics.totalModels,
              enabledModels: metrics.enabledModels,
              availableModels: metrics.availableModels,
            },
          })}\n\n`,
        );

        // Send provider health updates every 30 seconds
        const providerStatus = await this.multiLLMService.getProviderStatus();
        res.write(
          `data: ${JSON.stringify({
            type: "provider_health",
            timestamp: new Date().toISOString(),
            data: providerStatus,
          })}\n\n`,
        );
      } catch (error) {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            timestamp: new Date().toISOString(),
            error: "Failed to fetch metrics",
          })}\n\n`,
        );
      }
    }, 30000); // Send heartbeat every 30 seconds

    // Handle client disconnect
    res.on("close", () => {
      clearInterval(interval);
      console.log("SSE client disconnected");
    });

    // Handle errors
    res.on("error", (error) => {
      clearInterval(interval);
      console.error("SSE stream error:", error);
    });
  }

  @Get("multi-llm/stream")
  async streamMultiLLMEvents(@Res() res: Response) {
    // Set SSE headers
    res.writeHead(HttpStatus.OK, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Send initial connection event
    res.write(
      `data: ${JSON.stringify({
        type: "multi_llm_connected",
        timestamp: new Date().toISOString(),
        message: "Multi-LLM SSE connection established",
      })}\n\n`,
    );

    // Send initial provider status
    try {
      const providerStatus = await this.multiLLMService.getProviderStatus();
      const providerCosts = await this.multiLLMService.getProviderCosts();
      const metrics = this.multiLLMService.getMetrics();

      res.write(
        `data: ${JSON.stringify({
          type: "multi_llm_status",
          timestamp: new Date().toISOString(),
          data: {
            providers: providerStatus,
            costs: providerCosts,
            metrics: metrics,
          },
        })}\n\n`,
      );
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: "multi_llm_status",
          timestamp: new Date().toISOString(),
          error: "Failed to fetch initial status",
        })}\n\n`,
      );
    }

    // Keep connection alive with periodic updates
    const interval = setInterval(async () => {
      try {
        // Update provider status every 15 seconds
        const providerStatus = await this.multiLLMService.getProviderStatus();
        const providerCosts = await this.multiLLMService.getProviderCosts();
        const metrics = this.multiLLMService.getMetrics();

        res.write(
          `data: ${JSON.stringify({
            type: "multi_llm_update",
            timestamp: new Date().toISOString(),
            data: {
              providers: providerStatus,
              costs: providerCosts,
              metrics: metrics,
            },
          })}\n\n`,
        );
      } catch (error) {
        res.write(
          `data: ${JSON.stringify({
            type: "multi_llm_error",
            timestamp: new Date().toISOString(),
            error: "Failed to fetch updated status",
          })}\n\n`,
        );
      }
    }, 15000); // Update every 15 seconds

    // Handle client disconnect
    res.on("close", () => {
      clearInterval(interval);
      console.log("Multi-LLM SSE client disconnected");
    });

    // Handle errors
    res.on("error", (error) => {
      clearInterval(interval);
      console.error("Multi-LLM SSE stream error:", error);
    });
  }

  @Get("system/stream")
  async streamSystemEvents(@Res() res: Response) {
    // Set SSE headers
    res.writeHead(HttpStatus.OK, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Send initial connection event
    res.write(
      `data: ${JSON.stringify({
        type: "system_connected",
        timestamp: new Date().toISOString(),
        message: "System monitoring SSE connection established",
      })}\n\n`,
    );

    // Send initial system status
    res.write(
      `data: ${JSON.stringify({
        type: "system_status",
        timestamp: new Date().toISOString(),
        data: {
          phase: "14.1",
          status: "healthy",
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version,
          environment: this.configService.get<string>(
            "NODE_ENV",
            "development",
          ),
        },
      })}\n\n`,
    );

    // Keep connection alive with periodic system updates
    const interval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      res.write(
        `data: ${JSON.stringify({
          type: "system_metrics",
          timestamp: new Date().toISOString(),
          data: {
            uptime: process.uptime(),
            memory: {
              rss: memoryUsage.rss,
              heapTotal: memoryUsage.heapTotal,
              heapUsed: memoryUsage.heapUsed,
              external: memoryUsage.external,
            },
            cpu: {
              user: cpuUsage.user,
              system: cpuUsage.system,
            },
            load: (process as any).loadavg ? (process as any).loadavg() : null,
          },
        })}\n\n`,
      );
    }, 10000); // Update every 10 seconds

    // Handle client disconnect
    res.on("close", () => {
      clearInterval(interval);
      console.log("System SSE client disconnected");
    });

    // Handle errors
    res.on("error", (error) => {
      clearInterval(interval);
      console.error("System SSE stream error:", error);
    });
  }
}
