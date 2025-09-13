import { NextRequest, NextResponse } from 'next/server'

export class ErrorHandler {
  static handle(error: Error, context: string = 'unknown'): NextResponse {
    console.error(`[ERROR] ${context}:`, error)
    
    // Log error for monitoring
    this.logError(error, context)
    
    // Return standardized error response
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        context,
        requestId: this.generateRequestId()
      },
      {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      }
    )
  }

  static handleValidationError(errors: string[], context: string = 'validation'): NextResponse {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Invalid input provided',
        code: 'VALIDATION_ERROR',
        details: errors,
        timestamp: new Date().toISOString(),
        context,
        requestId: this.generateRequestId()
      },
      {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      }
    )
  }

  static handleNotFoundError(resource: string, context: string = 'not_found'): NextResponse {
    return NextResponse.json(
      {
        error: 'Not Found',
        message: `${resource} not found`,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        context,
        requestId: this.generateRequestId()
      },
      {
        status: 404,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
          'content-disposition': 'inline'
        }
      }
    )
  }

  private static logError(error: Error, context: string): void {
    // In production, this would send to monitoring service
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      message: error.message,
      stack: error.stack,
      requestId: this.generateRequestId()
    }
    
    console.error(JSON.stringify(errorLog))
  }

  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}