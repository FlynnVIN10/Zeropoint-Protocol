// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get, Res, Query, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('sse')
export class SSEController {
  constructor(
    private configService: ConfigService
  ) {}

  @Get('stream')
  async streamEvents(@Res() res: Response, @Query('type') eventType?: string) {
    // Set SSE headers
    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      timestamp: new Date().toISOString(),
      message: 'SSE connection established'
    })}\n\n`);

    // Send system status event
    res.write(`data: ${JSON.stringify({
      type: 'system_status',
      timestamp: new Date().toISOString(),
      data: {
        phase: '13.1',
        status: 'healthy',
        uptime: process.uptime(),
        services: {
          database: 'healthy',
          api: 'healthy',
          sse: 'active'
        }
      }
    })}\n\n`);

    // Keep connection alive with periodic events
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      })}\n\n`);
    }, 30000); // Send heartbeat every 30 seconds

    // Handle client disconnect
    res.on('close', () => {
      clearInterval(interval);
      console.log('SSE client disconnected');
    });

    // Handle errors
    res.on('error', (error) => {
      clearInterval(interval);
      console.error('SSE stream error:', error);
    });
  }

  @Get('status')
  async getSSEStatus(@Res() res: Response) {
    res.status(HttpStatus.OK).json({
      status: 'active',
      timestamp: new Date().toISOString(),
      endpoints: {
        stream: '/v1/sse/stream',
        status: '/v1/sse/status'
      },
      features: [
        'Real-time system status updates',
        'Connection heartbeat',
        'Event streaming',
        'Automatic reconnection support'
      ]
    });
  }
}
