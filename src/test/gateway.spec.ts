// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller.js';
import { AppService } from '../app.service.js';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

// Mock external dependencies
jest.mock('../agents/soulchain/soulchain.ledger.js', () => ({
  soulchain: {
    addXPTransaction: jest.fn().mockResolvedValue({ cid: 'test-cid' }),
    getLedgerMetrics: jest.fn().mockResolvedValue('test-metrics'),
    persistLedgerToIPFS: jest.fn().mockResolvedValue('test-persist-cid')
  }
}));

jest.mock('../agents/train/petals.bridge.js', () => ({
  callPetalsAPI: jest.fn().mockResolvedValue({ response: 'test-response' }),
  logTrainingCycle: jest.fn().mockResolvedValue(true),
  formatProposal: jest.fn().mockReturnValue({ formatted: 'proposal' })
}));

jest.mock('../guards/synthient.guard.js', () => ({
  checkIntent: jest.fn().mockReturnValue(true)
}));

describe('NestJS Gateway API (Phase 2)', () => {
  let appController: AppController;
  let appService: AppService;
  let httpService: HttpService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn()
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token')
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:8000')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: HttpService,
          useValue: mockHttpService
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
    httpService = module.get<HttpService>(HttpService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('Gateway Core Functionality', () => {
    describe('getHello', () => {
      it('should return gateway welcome message', async () => {
        const result = await appController.getHello();
        expect(result).toBe('Zeropoint Protocol API Gateway v1.0');
      });
    });

    describe('getStatus', () => {
      it('should return gateway status information', async () => {
        const result = await appController.getStatus();
        expect(result).toEqual({
          service: 'Zeropoint Protocol API Gateway',
          version: '1.0.0',
          status: 'operational',
          timestamp: expect.any(String),
          endpoints: {
            auth: ['/v1/register', '/v1/login', '/v1/protected'],
            generation: ['/v1/generate-text', '/v1/generate-image', '/v1/generate-code'],
            storage: ['/v1/ipfs/upload', '/v1/ipfs/download', '/v1/ipfs/list'],
            monitoring: ['/v1/health', '/v1/metrics', '/v1/ledger-metrics'],
            blockchain: ['/v1/soulchain/persist']
          }
        });
      });
    });

    describe('healthCheck', () => {
      it('should return health status', async () => {
        mockHttpService.get.mockReturnValue(of({ status: 200 }));
        const result = await appController.healthCheck();
        expect(result).toHaveProperty('status', 'ok');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('services');
        expect(result).toHaveProperty('metrics');
      });
    });
  });

  describe('Python Backend Integration', () => {
    describe('generateText', () => {
      it('should forward text generation request to Python backend', async () => {
        const mockResponse = { data: { generated_text: 'Test response' } };
        mockHttpService.post.mockReturnValue(of(mockResponse));

        const dto = { text: 'Test prompt', options: { max_length: 100 } };
        const result = await appController.generateText(dto);

        expect(mockHttpService.post).toHaveBeenCalledWith(
          'http://localhost:8000/v1/generate-text',
          dto,
          expect.objectContaining({
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
              'X-Zeropoint-Gateway': 'true'
            }
          })
        );
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle Python backend errors', async () => {
        mockHttpService.post.mockReturnValue(throwError(() => new Error('Backend error')));

        const dto = { text: 'Test prompt' };
        await expect(appController.generateText(dto)).rejects.toThrow('Backend error');
      });
    });

    describe('generateImage', () => {
      it('should forward image generation request to Python backend', async () => {
        const mockResponse = { data: { image_url: 'test-image.jpg' } };
        mockHttpService.post.mockReturnValue(of(mockResponse));

        const dto = { prompt: 'Test image prompt', options: { size: '512x512' } };
        const result = await appController.generateImage(dto);

        expect(mockHttpService.post).toHaveBeenCalledWith(
          'http://localhost:8000/v1/generate-image',
          dto,
          expect.any(Object)
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('generateCode', () => {
      it('should forward code generation request to Python backend', async () => {
        const mockResponse = { data: { code: 'console.log("test")' } };
        mockHttpService.post.mockReturnValue(of(mockResponse));

        const dto = { prompt: 'Create a hello world function', language: 'javascript' };
        const result = await appController.generateCode(dto);

        expect(mockHttpService.post).toHaveBeenCalledWith(
          'http://localhost:8000/v1/generate-code',
          dto,
          expect.any(Object)
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('Legacy generate endpoint', () => {
      it('should handle legacy generate endpoint for backward compatibility', async () => {
        const mockResponse = { data: { generated_text: 'Legacy response' } };
        mockHttpService.post.mockReturnValue(of(mockResponse));

        const result = await appController.generateLegacy('Legacy prompt');
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('Authentication System', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
        mockUserRepository.findOneBy.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(mockUser);
        mockUserRepository.save.mockResolvedValue(mockUser);

        const dto = { username: 'testuser', password: 'password123' };
        const result = await appController.register(dto);

        expect(result).toEqual({
          success: true,
          id: mockUser.id,
          username: mockUser.username,
          message: 'User registered successfully'
        });
      });

      it('should reject duplicate username', async () => {
        mockUserRepository.findOneBy.mockResolvedValue({ id: 1, username: 'testuser' });

        const dto = { username: 'testuser', password: 'password123' };
        await expect(appController.register(dto)).rejects.toThrow(HttpException);
      });

      it('should handle registration errors', async () => {
        mockUserRepository.findOneBy.mockRejectedValue(new Error('Database error'));

        const dto = { username: 'testuser', password: 'password123' };
        await expect(appController.register(dto)).rejects.toThrow(HttpException);
      });
    });

    describe('login', () => {
      it('should login with valid credentials', async () => {
        const mockUser = { id: 1, username: 'testuser', password: 'password123' };
        mockUserRepository.findOneBy.mockResolvedValue(mockUser);

        const dto = { username: 'testuser', password: 'password123' };
        const result = await appController.login(dto);

        expect(result).toEqual({
          success: true,
          access_token: 'mock-jwt-token',
          user: {
            id: mockUser.id,
            username: mockUser.username
          }
        });
        expect(jwtService.sign).toHaveBeenCalledWith(
          { sub: mockUser.id, username: mockUser.username },
          { secret: process.env.JWT_SECRET }
        );
      });

      it('should reject invalid credentials', async () => {
        mockUserRepository.findOneBy.mockResolvedValue(null);

        const dto = { username: 'testuser', password: 'wrongpassword' };
        await expect(appController.login(dto)).rejects.toThrow(HttpException);
      });

      it('should handle login errors', async () => {
        mockUserRepository.findOneBy.mockRejectedValue(new Error('Database error'));

        const dto = { username: 'testuser', password: 'password123' };
        await expect(appController.login(dto)).rejects.toThrow(HttpException);
      });
    });
  });

  describe('IPFS Integration', () => {
    describe('uploadFile', () => {
      it('should upload file to IPFS successfully', async () => {
        const mockFile = {
          buffer: Buffer.from('test file content'),
          originalname: 'test.txt',
          size: 18
        };

        jest.spyOn(appService, 'uploadFile').mockResolvedValue('test-cid');

        const result = await appController.uploadFile(mockFile, 'Test upload rationale');

        expect(result).toEqual({
          success: true,
          cid: 'test-cid',
          filename: 'test.txt',
          size: 18,
          message: 'File uploaded successfully'
        });
      });

      it('should handle missing file', async () => {
        await expect(appController.uploadFile(null, 'Test rationale')).rejects.toThrow(HttpException);
      });

      it('should handle upload errors', async () => {
        const mockFile = {
          buffer: Buffer.from('test'),
          originalname: 'test.txt',
          size: 4
        };

        jest.spyOn(appService, 'uploadFile').mockRejectedValue(new Error('Upload failed'));

        await expect(appController.uploadFile(mockFile, 'Test rationale')).rejects.toThrow(HttpException);
      });
    });

    describe('downloadFile', () => {
      it('should download file from IPFS successfully', async () => {
        const mockBuffer = Buffer.from('test file content');
        jest.spyOn(appService, 'downloadFile').mockResolvedValue(mockBuffer);

        const mockRes = {
          set: jest.fn(),
          send: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        await appController.downloadFile('test-cid', 'Test download rationale', mockRes);

        expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
        expect(mockRes.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="file-test-cid"');
        expect(mockRes.send).toHaveBeenCalledWith(mockBuffer);
      });

      it('should handle download errors', async () => {
        jest.spyOn(appService, 'downloadFile').mockRejectedValue(new Error('Download failed'));

        const mockRes = {
          set: jest.fn(),
          send: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        await appController.downloadFile('test-cid', 'Test rationale', mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          message: 'Download failed'
        });
      });
    });

    describe('listDirectory', () => {
      it('should list IPFS directory contents', async () => {
        const mockEntries = [
          { name: 'file1.txt', cid: 'cid1', size: 100, type: 'file' },
          { name: 'folder1', cid: 'cid2', size: 0, type: 'directory' }
        ];

        jest.spyOn(appService, 'listDirectory').mockResolvedValue(mockEntries);

        const result = await appController.listDirectory('test-cid');

        expect(result).toEqual({
          success: true,
          cid: 'test-cid',
          entries: mockEntries,
          count: 2
        });
      });

      it('should handle listing errors', async () => {
        jest.spyOn(appService, 'listDirectory').mockRejectedValue(new Error('Listing failed'));

        await expect(appController.listDirectory('test-cid')).rejects.toThrow(HttpException);
      });
    });
  });

  describe('Soulchain Integration', () => {
    describe('persistSoulchain', () => {
      it('should persist soulchain ledger to IPFS', async () => {
        const { soulchain } = require('../agents/soulchain/soulchain.ledger.js');
        soulchain.persistLedgerToIPFS.mockResolvedValue('persist-cid');

        const result = await appController.persistSoulchain();

        expect(result).toEqual({
          success: true,
          cid: 'persist-cid',
          message: 'Soulchain ledger persisted to IPFS successfully'
        });
      });

      it('should handle persistence errors', async () => {
        const { soulchain } = require('../agents/soulchain/soulchain.ledger.js');
        soulchain.persistLedgerToIPFS.mockRejectedValue(new Error('Persistence failed'));

        await expect(appController.persistSoulchain()).rejects.toThrow(HttpException);
      });
    });

    describe('getLedgerMetrics', () => {
      it('should return soulchain ledger metrics', async () => {
        const mockRes = {
          set: jest.fn(),
          send: jest.fn()
        };

        await appController.getLedgerMetrics(mockRes);

        expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
        expect(mockRes.send).toHaveBeenCalledWith('test-metrics');
      });
    });
  });

  describe('Petals Integration', () => {
    describe('proposeWithPetals', () => {
      it('should process Petals proposal successfully', async () => {
        const mockProposal = {
          rationale: 'Test proposal',
          proposedCode: 'console.log("test")',
          agentId: 'test-agent'
        };

        jest.spyOn(appService, 'proposeWithPetals').mockResolvedValue({ 
          rewrittenCode: 'console.log("test")',
          trustScore: 0.9,
          ethicalRating: 'aligned',
          notes: ['Test proposal accepted']
        });

        const result = await appController.proposeWithPetals(mockProposal);

        expect(result).toEqual({
          success: true,
          response: { 
            rewrittenCode: 'console.log("test")',
            trustScore: 0.9,
            ethicalRating: 'aligned',
            notes: ['Test proposal accepted']
          },
          message: 'Petals proposal processed successfully'
        });
      });

      it('should handle Petals proposal errors', async () => {
        const mockProposal = {
          rationale: 'Test proposal',
          proposedCode: 'console.log("test")',
          agentId: 'test-agent'
        };

        jest.spyOn(appService, 'proposeWithPetals').mockRejectedValue(new Error('Petals error'));

        await expect(appController.proposeWithPetals(mockProposal)).rejects.toThrow(HttpException);
      });
    });
  });

  describe('Metrics and Monitoring', () => {
    describe('getMetrics', () => {
      it('should return Prometheus metrics', async () => {
        const mockRes = {
          set: jest.fn(),
          send: jest.fn()
        };

        jest.spyOn(appService, 'getMetrics').mockResolvedValue('test-metrics');

        await appController.getMetrics(mockRes);

        expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
        expect(mockRes.send).toHaveBeenCalledWith('test-metrics');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Zeroth-gate violations', async () => {
      const { checkIntent } = require('../guards/synthient.guard.js');
      checkIntent.mockReturnValue(false);

      await expect(appController.getHello()).rejects.toThrow('Zeroth violation: getHello blocked.');
    });

    it('should handle HTTP service errors gracefully', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Network error')));

      const dto = { text: 'Test prompt' };
      await expect(appController.generateText(dto)).rejects.toThrow('Network error');
    });
  });

  describe('Validation', () => {
    it('should validate DTOs correctly', async () => {
      const invalidDto = { text: '' }; // Empty text should fail validation
      
      await expect(appController.generateText(invalidDto)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const invalidDto = { text: 'valid text' }; // This should pass validation
      
      // Mock the service to avoid actual HTTP calls
      jest.spyOn(appService, 'generateText').mockResolvedValue({ generated_text: 'test' });
      
      const result = await appController.generateText(invalidDto);
      expect(result).toEqual({ generated_text: 'test' });
    });
  });
}); 