// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "../services/auth.service.js";
import { User } from "../entities/user.entity.js";
import { Session } from "../entities/session.entity.js";
import { AuditLog } from "../entities/audit-log.entity.js";
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "../dto/auth.dto.js";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: any;
  let sessionRepository: any;
  let auditLogRepository: any;
  let jwtService: any;
  let configService: any;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    sessionRepository = module.get(getRepositoryToken(Session));
    auditLogRepository = module.get(getRepositoryToken(AuditLog));
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Mock config service
    configService.get.mockReturnValue("test-secret");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      username: "testuser",
      email: "test@example.com",
      password: "TestPass123!",
      firstName: "Test",
      lastName: "User",
    };

    it("should register a new user successfully", async () => {
      // Mock user not existing
      userRepository.findOne.mockResolvedValue(null);

      // Mock user creation
      const mockUser = {
        id: "user-id",
        username: registerDto.username,
        email: registerDto.email,
        roles: ["user"],
        toJSON: jest.fn().mockReturnValue({
          id: "user-id",
          username: registerDto.username,
          email: registerDto.email,
        }),
      };
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Mock JWT token generation
      jwtService.sign.mockReturnValue("mock-access-token");

      // Mock audit log
      auditLogRepository.create.mockReturnValue({});
      auditLogRepository.save.mockResolvedValue({});

      const result = await service.register(
        registerDto,
        "127.0.0.1",
        "test-agent",
      );

      expect(result.success).toBe(true);
      expect(result.user.username).toBe(registerDto.username);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe("mock-access-token");
      expect(userRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException if user already exists", async () => {
      userRepository.findOne.mockResolvedValue({ id: "existing-user" });

      await expect(
        service.register(registerDto, "127.0.0.1", "test-agent"),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      username: "testuser",
      password: "TestPass123!",
    };

    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user-id",
        username: "testuser",
        email: "test@example.com",
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        lastLoginAt: null,
        toJSON: jest.fn().mockReturnValue({
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
        }),
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue("mock-access-token");
      sessionRepository.create.mockReturnValue({});
      sessionRepository.save.mockResolvedValue({});
      auditLogRepository.create.mockReturnValue({});
      auditLogRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto, "127.0.0.1", "test-agent");

      expect(result.success).toBe(true);
      expect(result.user.username).toBe("testuser");
      expect(result.accessToken).toBe("mock-access-token");
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login(loginDto, "127.0.0.1", "test-agent"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const mockUser = {
        id: "user-id",
        username: "testuser",
        isActive: false,
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login(loginDto, "127.0.0.1", "test-agent"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const mockUser = {
        id: "user-id",
        username: "testuser",
        isActive: true,
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login(loginDto, "127.0.0.1", "test-agent"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      sessionRepository.update.mockResolvedValue({ affected: 1 });
      auditLogRepository.create.mockReturnValue({});
      auditLogRepository.save.mockResolvedValue({});

      const result = await service.logout(
        "user-id",
        "refresh-token",
        "127.0.0.1",
      );

      expect(result.success).toBe(true);
      expect(sessionRepository.update).toHaveBeenCalledWith(
        { token: "refresh-token", userId: "user-id" },
        { isActive: false },
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockSession = {
        id: "session-id",
        isActive: true,
        isExpired: jest.fn().mockReturnValue(false),
        lastUsedAt: new Date(),
        user: {
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
          roles: ["user"],
        },
      };

      sessionRepository.findOne.mockResolvedValue(mockSession);
      sessionRepository.save.mockResolvedValue(mockSession);
      jwtService.sign.mockReturnValue("new-access-token");

      const result = await service.refreshToken("refresh-token", "127.0.0.1");

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe("new-access-token");
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refreshToken("invalid-token", "127.0.0.1"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("changePassword", () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: "OldPass123!",
      newPassword: "NewPass123!",
    };

    it("should change password successfully", async () => {
      const mockUser = {
        id: "user-id",
        validatePassword: jest.fn().mockResolvedValue(true),
        password: "new-hashed-password",
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      sessionRepository.update.mockResolvedValue({ affected: 1 });
      auditLogRepository.create.mockReturnValue({});
      auditLogRepository.save.mockResolvedValue({});

      const result = await service.changePassword(
        "user-id",
        changePasswordDto,
        "127.0.0.1",
      );

      expect(result.success).toBe(true);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
      );
      expect(sessionRepository.update).toHaveBeenCalledWith(
        { userId: "user-id" },
        { isActive: false },
      );
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword("user-id", changePasswordDto, "127.0.0.1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException for incorrect current password", async () => {
      const mockUser = {
        id: "user-id",
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.changePassword("user-id", changePasswordDto, "127.0.0.1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateProfile", () => {
    const updateProfileDto: UpdateProfileDto = {
      firstName: "Updated",
      lastName: "Name",
      email: "updated@example.com",
    };

    it("should update profile successfully", async () => {
      const mockUser = {
        id: "user-id",
        email: "old@example.com",
        toJSON: jest.fn().mockReturnValue({
          id: "user-id",
          firstName: "Updated",
          lastName: "Name",
          email: "updated@example.com",
        }),
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      auditLogRepository.create.mockReturnValue({});
      auditLogRepository.save.mockResolvedValue({});

      const result = await service.updateProfile(
        "user-id",
        updateProfileDto,
        "127.0.0.1",
      );

      expect(result.success).toBe(true);
      expect(result.user.firstName).toBe("Updated");
      expect(result.user.lastName).toBe("Name");
      expect(result.user.email).toBe("updated@example.com");
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile("user-id", updateProfileDto, "127.0.0.1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile successfully", async () => {
      const mockUser = {
        id: "user-id",
        username: "testuser",
        email: "test@example.com",
        toJSON: jest.fn().mockReturnValue({
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
        }),
      };

      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserProfile("user-id");

      expect(result.success).toBe(true);
      expect(result.user.id).toBe("user-id");
      expect(result.user.username).toBe("testuser");
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserProfile("user-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
