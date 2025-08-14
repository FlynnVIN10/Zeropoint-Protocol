import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Sse,
  MessageEvent,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SandboxService } from "../services/sandbox.service.js";
import { SandboxCreateRequest } from "./petals.controller.js";

@Controller("sandbox")
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post("create")
  async createSandbox(@Body() request: SandboxCreateRequest): Promise<any> {
    const sandboxId = await this.sandboxService.createSandbox(request);
    return {
      status: "success",
      data: {
        sandboxId,
        status: "creating",
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post(":sandboxId/execute")
  async executeCommand(
    @Param("sandboxId") sandboxId: string,
    @Body() body: { command: string },
  ): Promise<any> {
    const result = await this.sandboxService.executeInSandbox(
      sandboxId,
      body.command,
    );
    return {
      status: "success",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":sandboxId/status")
  async getSandboxStatus(@Param("sandboxId") sandboxId: string): Promise<any> {
    const status = await this.sandboxService.getSandboxStatus(sandboxId);
    return {
      status: "success",
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":sandboxId/logs")
  async getSandboxLogs(
    @Param("sandboxId") sandboxId: string,
    @Body() body: { lines?: number } = {},
  ): Promise<any> {
    const logs = await this.sandboxService.getSandboxLogs(
      sandboxId,
      body.lines || 100,
    );
    return {
      status: "success",
      data: {
        sandboxId,
        logs,
        lineCount: logs.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Sse(":sandboxId/stream")
  streamSandboxStatus(
    @Param("sandboxId") sandboxId: string,
  ): Observable<MessageEvent> {
    const stream = this.sandboxService.createStatusStream(sandboxId);

    return new Observable((observer) => {
      stream.on("data", (data) => {
        observer.next({
          data: data.toString(),
        });
      });

      stream.on("end", () => {
        observer.complete();
      });

      stream.on("error", (error) => {
        observer.error(error);
      });

      return () => {
        // Clean up stream - ReadableStream doesn't have destroy method
        // The stream will be garbage collected when no longer referenced
      };
    });
  }

  @Post(":sandboxId/pause")
  async pauseSandbox(@Param("sandboxId") sandboxId: string): Promise<any> {
    await this.sandboxService.pauseSandbox(sandboxId);
    return {
      status: "success",
      message: `Sandbox ${sandboxId} paused successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(":sandboxId/resume")
  async resumeSandbox(@Param("sandboxId") sandboxId: string): Promise<any> {
    await this.sandboxService.resumeSandbox(sandboxId);
    return {
      status: "success",
      message: `Sandbox ${sandboxId} resumed successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":sandboxId")
  async destroySandbox(@Param("sandboxId") sandboxId: string): Promise<any> {
    await this.sandboxService.destroySandbox(sandboxId);
    return {
      status: "success",
      message: `Sandbox ${sandboxId} destroyed successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("list")
  async listSandboxes(): Promise<any> {
    const sandboxes = await this.sandboxService.listSandboxes();
    return {
      status: "success",
      data: {
        sandboxes,
        count: sandboxes.length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
