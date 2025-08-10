/**
 * Wondercraft Integration - Briefings, Opt-in, URL/Transcript Handling
 * 
 * @fileoverview Provides integration with Wondercraft for audio content management
 * @author Dev Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { createHmac } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface WondercraftConfig {
  baseUrl: string;
  apiKey: string;
  webhookSecret: string;
  enableOptIn: boolean;
  enableTranscripts: boolean;
  maxFileSize: number;        // MB
  supportedFormats: string[];
  retentionDays: number;
  enableCompression: boolean;
  timeout: number;            // milliseconds
}

export interface Briefing {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  transcriptUrl?: string;
  duration: number;           // seconds
  fileSize: number;           // MB
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  metadata: {
    speaker?: string;
    language?: string;
    tags?: string[];
    category?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface Transcript {
  id: string;
  briefingId: string;
  content: string;
  segments: TranscriptSegment[];
  confidence: number;
  language: string;
  wordCount: number;
  createdAt: number;
  metadata: {
    model: string;
    processingTime: number;
    quality: 'low' | 'medium' | 'high';
  };
}

export interface TranscriptSegment {
  start: number;              // seconds
  end: number;                // seconds
  text: string;
  confidence: number;
  speaker?: string;
}

export interface OptInRequest {
  userId: string;
  email: string;
  preferences: {
    briefings: boolean;
    transcripts: boolean;
    notifications: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  consentTimestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface OptInResponse {
  success: boolean;
  optInId: string;
  status: 'active' | 'pending' | 'expired';
  expiresAt: number;
  message: string;
}

export interface WebhookEvent {
  type: 'briefing.created' | 'briefing.updated' | 'transcript.ready' | 'optin.confirmed';
  data: any;
  timestamp: number;
  signature: string;
}

/**
 * Wondercraft Integration
 * Provides integration with Wondercraft for audio content management
 */
export class WondercraftIntegration extends EventEmitter {
  private config: WondercraftConfig;
  private isEnabled: boolean;
  private briefings: Map<string, Briefing> = new Map();
  private transcripts: Map<string, Transcript> = new Map();
  private optIns: Map<string, OptInRequest> = new Map();
  private webhookHandlers: Map<string, (event: WebhookEvent) => Promise<void>> = new Map();

  constructor(config?: Partial<WondercraftConfig>) {
    super();
    this.config = {
      baseUrl: process.env.WONDERCRAFT_BASE_URL || 'https://api.wondercraft.ai',
      apiKey: process.env.WONDERCRAFT_API_KEY || '',
      webhookSecret: process.env.WONDERCRAFT_WEBHOOK_SECRET || 'default-secret-change-in-production',
      enableOptIn: true,
      enableTranscripts: true,
      maxFileSize: 100,               // 100MB
      supportedFormats: ['mp3', 'wav', 'm4a', 'flac'],
      retentionDays: 90,
      enableCompression: true,
      timeout: 30000,                 // 30 seconds
      ...config
    };

    // Check if Wondercraft is enabled
    this.isEnabled = !!this.config.apiKey;
    
    if (this.isEnabled) {
      console.log('Wondercraft integration enabled and configured');
      this.setupWebhookHandlers();
    } else {
      console.log('Wondercraft integration disabled or not configured');
    }
  }

  /**
   * Check if integration is enabled
   */
  isWondercraftEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Create a new briefing
   */
  async createBriefing(
    title: string,
    description: string,
    audioUrl: string,
    metadata?: Partial<Briefing['metadata']>
  ): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Wondercraft integration is disabled');
    }

    try {
      // Validate audio URL
      this.validateAudioUrl(audioUrl);

      // Create briefing
      const briefing: Briefing = {
        id: `briefing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        audioUrl,
        duration: 0, // Will be updated when processed
        fileSize: 0, // Will be updated when processed
        format: this.getAudioFormat(audioUrl),
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          speaker: 'Unknown',
          language: 'en',
          tags: [],
          category: 'general',
          priority: 'medium',
          ...metadata
        }
      };

      // Store briefing
      this.briefings.set(briefing.id, briefing);

      // Emit event
      this.emit('briefing_created', briefing);

      // Process briefing
      this.processBriefing(briefing.id);

      return briefing.id;

    } catch (error) {
      console.error('Failed to create briefing:', error);
      throw error;
    }
  }

  /**
   * Get briefing by ID
   */
  async getBriefing(briefingId: string): Promise<Briefing | null> {
    return this.briefings.get(briefingId) || null;
  }

  /**
   * List all briefings
   */
  async listBriefings(filters?: {
    status?: Briefing['status'];
    category?: string;
    speaker?: string;
    limit?: number;
  }): Promise<Briefing[]> {
    let briefings = Array.from(this.briefings.values());

    // Apply filters
    if (filters?.status) {
      briefings = briefings.filter(b => b.status === filters.status);
    }

    if (filters?.category) {
      briefings = briefings.filter(b => b.metadata.category === filters.category);
    }

    if (filters?.speaker) {
      briefings = briefings.filter(b => b.metadata.speaker === filters.speaker);
    }

    // Sort by creation date (newest first)
    briefings.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (filters?.limit) {
      briefings = briefings.slice(0, filters.limit);
    }

    return briefings;
  }

  /**
   * Update briefing
   */
  async updateBriefing(
    briefingId: string,
    updates: Partial<Omit<Briefing, 'id' | 'createdAt'>>
  ): Promise<boolean> {
    const briefing = this.briefings.get(briefingId);
    if (!briefing) {
      return false;
    }

    // Update fields
    Object.assign(briefing, updates);
    briefing.updatedAt = Date.now();

    // Store updated briefing
    this.briefings.set(briefingId, briefing);

    // Emit event
    this.emit('briefing_updated', briefing);

    return true;
  }

  /**
   * Delete briefing
   */
  async deleteBriefing(briefingId: string): Promise<boolean> {
    const briefing = this.briefings.get(briefingId);
    if (!briefing) {
      return false;
    }

    // Remove briefing
    this.briefings.delete(briefingId);

    // Remove associated transcript
    this.transcripts.delete(briefingId);

    // Emit event
    this.emit('briefing_deleted', briefing);

    return true;
  }

  /**
   * Get transcript for briefing
   */
  async getTranscript(briefingId: string): Promise<Transcript | null> {
    return this.transcripts.get(briefingId) || null;
  }

  /**
   * Create transcript manually
   */
  async createTranscript(
    briefingId: string,
    content: string,
    segments: TranscriptSegment[],
    metadata?: Partial<Transcript['metadata']>
  ): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Wondercraft integration is disabled');
    }

    const briefing = this.briefings.get(briefingId);
    if (!briefing) {
      throw new Error(`Briefing ${briefingId} not found`);
    }

    const transcript: Transcript = {
      id: `transcript-${briefingId}-${Date.now()}`,
      briefingId,
      content,
      segments,
      confidence: this.calculateConfidence(segments),
      language: briefing.metadata.language || 'en',
      wordCount: content.split(/\s+/).length,
      createdAt: Date.now(),
      metadata: {
        model: 'manual',
        processingTime: 0,
        quality: 'high',
        ...metadata
      }
    };

    // Store transcript
    this.transcripts.set(briefingId, transcript);

    // Update briefing status
    await this.updateBriefing(briefingId, { status: 'completed' });

    // Emit event
    this.emit('transcript_created', transcript);

    return transcript.id;
  }

  /**
   * Process opt-in request
   */
  async processOptIn(request: OptInRequest): Promise<OptInResponse> {
    if (!this.isEnabled || !this.config.enableOptIn) {
      throw new Error('Opt-in is disabled');
    }

    try {
      // Validate request
      this.validateOptInRequest(request);

      // Generate opt-in ID
      const optInId = `optin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Store opt-in request
      this.optIns.set(optInId, request);

      // Calculate expiration (30 days from now)
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

      // Emit event
      this.emit('optin_requested', { optInId, request });

      return {
        success: true,
        optInId,
        status: 'pending',
        expiresAt,
        message: 'Opt-in request received. Please check your email to confirm.'
      };

    } catch (error) {
      console.error('Failed to process opt-in:', error);
      throw error;
    }
  }

  /**
   * Confirm opt-in
   */
  async confirmOptIn(optInId: string): Promise<boolean> {
    const optIn = this.optIns.get(optInId);
    if (!optIn) {
      return false;
    }

    // Update opt-in status
    optIn.preferences.briefings = true;
    optIn.preferences.transcripts = true;

    // Emit event
    this.emit('optin_confirmed', { optInId, optIn });

    return true;
  }

  /**
   * Get opt-in status
   */
  async getOptInStatus(userId: string): Promise<OptInRequest | null> {
    for (const [optInId, optIn] of this.optIns.entries()) {
      if (optIn.userId === userId) {
        return optIn;
      }
    }
    return null;
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Wondercraft integration is disabled');
    }

    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(event)) {
        throw new Error('Invalid webhook signature');
      }

      // Get handler for event type
      const handler = this.webhookHandlers.get(event.type);
      if (handler) {
        await handler(event);
      } else {
        console.warn(`No handler found for webhook event type: ${event.type}`);
      }

      // Emit webhook event
      this.emit('webhook_received', event);

    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  /**
   * Setup webhook handlers
   */
  private setupWebhookHandlers(): void {
    // Briefing created handler
    this.webhookHandlers.set('briefing.created', async (event) => {
      const briefing = event.data as Briefing;
      this.briefings.set(briefing.id, briefing);
      this.emit('webhook_briefing_created', briefing);
    });

    // Briefing updated handler
    this.webhookHandlers.set('briefing.updated', async (event) => {
      const briefing = event.data as Briefing;
      this.briefings.set(briefing.id, briefing);
      this.emit('webhook_briefing_updated', briefing);
    });

    // Transcript ready handler
    this.webhookHandlers.set('transcript.ready', async (event) => {
      const transcript = event.data as Transcript;
      this.transcripts.set(transcript.briefingId, transcript);
      
      // Update briefing status
      await this.updateBriefing(transcript.briefingId, { status: 'completed' });
      
      this.emit('webhook_transcript_ready', transcript);
    });

    // Opt-in confirmed handler
    this.webhookHandlers.set('optin.confirmed', async (event) => {
      const { optInId, optIn } = event.data;
      this.optIns.set(optInId, optIn);
      this.emit('webhook_optin_confirmed', { optInId, optIn });
    });
  }

  /**
   * Process briefing (simulate audio processing)
   */
  private async processBriefing(briefingId: string): Promise<void> {
    const briefing = this.briefings.get(briefingId);
    if (!briefing) return;

    try {
      // Update status to processing
      await this.updateBriefing(briefingId, { status: 'processing' });

      // Simulate processing delay
      await this.sleep(5000);

      // Update briefing with mock data
      await this.updateBriefing(briefingId, {
        duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
        fileSize: Math.floor(Math.random() * 50) + 10,    // 10-60 MB
        status: 'completed'
      });

      // Generate mock transcript if enabled
      if (this.config.enableTranscripts) {
        await this.generateMockTranscript(briefingId);
      }

    } catch (error) {
      console.error(`Failed to process briefing ${briefingId}:`, error);
      await this.updateBriefing(briefingId, { status: 'failed' });
    }
  }

  /**
   * Generate mock transcript for demonstration
   */
  private async generateMockTranscript(briefingId: string): Promise<void> {
    const briefing = this.briefings.get(briefingId);
    if (!briefing) return;

    const mockContent = `This is a mock transcript for the briefing "${briefing.title}". 
    The actual transcript would be generated by Wondercraft's speech-to-text service. 
    This demonstrates the integration capabilities.`;

    const mockSegments: TranscriptSegment[] = [
      {
        start: 0,
        end: 5,
        text: "This is a mock transcript for the briefing",
        confidence: 0.95
      },
      {
        start: 5,
        end: 10,
        text: `"${briefing.title}". The actual transcript would be generated`,
        confidence: 0.92
      },
      {
        start: 10,
        end: 15,
        text: "by Wondercraft's speech-to-text service.",
        confidence: 0.89
      }
    ];

    await this.createTranscript(briefingId, mockContent, mockSegments, {
      model: 'mock-demo',
      processingTime: 5000,
      quality: 'high'
    });
  }

  /**
   * Validate audio URL
   */
  private validateAudioUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid audio URL');
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Audio URL must use HTTP or HTTPS protocol');
      }
    } catch (error) {
      throw new Error('Invalid audio URL format');
    }

    const format = this.getAudioFormat(url);
    if (!this.config.supportedFormats.includes(format)) {
      throw new Error(`Unsupported audio format: ${format}. Supported formats: ${this.config.supportedFormats.join(', ')}`);
    }
  }

  /**
   * Get audio format from URL
   */
  private getAudioFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'mp3';
  }

  /**
   * Validate opt-in request
   */
  private validateOptInRequest(request: OptInRequest): void {
    if (!request.userId || typeof request.userId !== 'string') {
      throw new Error('User ID is required');
    }

    if (!request.email || typeof request.email !== 'string') {
      throw new Error('Email is required');
    }

    if (!request.preferences || typeof request.preferences !== 'object') {
      throw new Error('Preferences are required');
    }

    if (request.consentTimestamp && typeof request.consentTimestamp !== 'number') {
      throw new Error('Consent timestamp must be a number');
    }
  }

  /**
   * Calculate confidence score from segments
   */
  private calculateConfidence(segments: TranscriptSegment[]): number {
    if (segments.length === 0) return 0;

    const totalConfidence = segments.reduce((sum, segment) => sum + segment.confidence, 0);
    return totalConfidence / segments.length;
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(event: WebhookEvent): boolean {
    const { signature, ...eventWithoutSignature } = event;
    const data = JSON.stringify(eventWithoutSignature);
    
    const expectedSignature = createHmac('sha256', this.config.webhookSecret)
      .update(data)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Get integration statistics
   */
  getStats(): {
    isEnabled: boolean;
    totalBriefings: number;
    totalTranscripts: number;
    totalOptIns: number;
    config: Partial<WondercraftConfig>;
  } {
    return {
      isEnabled: this.isEnabled,
      totalBriefings: this.briefings.size,
      totalTranscripts: this.transcripts.size,
      totalOptIns: this.optIns.size,
      config: {
        baseUrl: this.config.baseUrl,
        enableOptIn: this.config.enableOptIn,
        enableTranscripts: this.config.enableTranscripts,
        maxFileSize: this.config.maxFileSize,
        supportedFormats: this.config.supportedFormats
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WondercraftConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = !!this.config.apiKey;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.briefings.clear();
    this.transcripts.clear();
    this.optIns.clear();
    this.webhookHandlers.clear();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export default instance
export const wondercraftIntegration = new WondercraftIntegration();
