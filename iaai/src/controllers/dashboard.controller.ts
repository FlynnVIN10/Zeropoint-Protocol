import {
  Controller,
  Get,
  Post,
  Sse,
  MessageEvent,
  Res,
  Body,
} from "@nestjs/common";
import { Response } from "express";
import { Observable, interval } from "rxjs";
import { map } from "rxjs/operators";
import { DashboardService } from "../services/dashboard.service.js";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Sse("stream")
  stream(): Observable<MessageEvent> {
    return interval(2000).pipe(
      map(() => ({
        data: this.dashboardService.getDashboardUpdates(),
      })),
    );
  }

  @Get("agents/xp")
  async getAgentXP() {
    return this.dashboardService.getAgentXP();
  }

  @Get("status")
  async getDashboardStatus() {
    return this.dashboardService.getDashboardStatus();
  }

  @Post("telemetry")
  async logUXInteraction(@Body() body: any) {
    return this.dashboardService.logUXInteraction(body);
  }
}
