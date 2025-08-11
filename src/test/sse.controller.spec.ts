// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import { SSEController } from "../controllers/sse.controller.js";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

describe("SSEController", () => {
  let controller: SSEController;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SSEController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                SSE_ENABLED: true,
                SSE_HEARTBEAT_INTERVAL: 30000,
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<SSEController>(SSEController);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getSSEStatus", () => {
    it("should return SSE status information", async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.getSSEStatus(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          endpoints: {
            stream: "/v1/sse/stream",
            status: "/v1/sse/status",
          },
          features: expect.arrayContaining([
            "Real-time system status updates",
            "Connection heartbeat",
            "Event streaming",
            "Automatic reconnection support",
          ]),
        }),
      );
    });
  });

  describe("streamEvents", () => {
    it("should set correct SSE headers", async () => {
      const mockResponse = {
        writeHead: jest.fn(),
        write: jest.fn(),
        on: jest.fn(),
      } as unknown as Response;

      await controller.streamEvents(mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });
    });

    it("should send initial connection event", async () => {
      const mockResponse = {
        writeHead: jest.fn(),
        write: jest.fn(),
        on: jest.fn(),
      } as unknown as Response;

      await controller.streamEvents(mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"connection"'),
      );
    });

    it("should send system status event", async () => {
      const mockResponse = {
        writeHead: jest.fn(),
        write: jest.fn(),
        on: jest.fn(),
      } as unknown as Response;

      await controller.streamEvents(mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"system_status"'),
      );
    });
  });
});
