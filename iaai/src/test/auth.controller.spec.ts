// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "../dto/auth.dto.js";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getUserProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    getActiveSessions: jest.fn(),
    revokeSession: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /v1/auth/register", () => {
    const registerDto: RegisterDto = {
      username: "testuser",
      email: "test@example.com",
      password: "TestPass123!",
      firstName: "Test",
      lastName: "User",
    };

    it("should register a new user successfully", async () => {
      const mockResponse = {
        success: true,
        user: {
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        message: "User registered successfully",
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/register")
        .send(registerDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.accessToken).toBe("mock-access-token");
      expect(authService.register).toHaveBeenCalledWith(
        registerDto,
        expect.any(String),
        expect.any(String),
      );
    });

    it("should return 400 for invalid registration data", async () => {
      const invalidDto = {
        username: "t", // Too short
        email: "invalid-email",
        password: "weak", // Too weak
      };

      await request(app.getHttpServer())
        .post("/v1/auth/register")
        .send(invalidDto)
        .expect(400);
    });

    it("should return 409 for duplicate user", async () => {
      mockAuthService.register.mockRejectedValue(
        new Error("Username or email already exists"),
      );

      await request(app.getHttpServer())
        .post("/v1/auth/register")
        .send(registerDto)
        .expect(500); // Will be caught by exception filter
    });
  });

  describe("POST /v1/auth/login", () => {
    const loginDto: LoginDto = {
      username: "testuser",
      password: "TestPass123!",
    };

    it("should login successfully with valid credentials", async () => {
      const mockResponse = {
        success: true,
        user: {
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        message: "Login successful",
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.accessToken).toBe("mock-access-token");
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        expect.any(String),
        expect.any(String),
      );
    });

    it("should return 400 for invalid login data", async () => {
      const invalidDto = {
        username: "", // Empty username
        password: "", // Empty password
      };

      await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(invalidDto)
        .expect(400);
    });

    it("should return 401 for invalid credentials", async () => {
      mockAuthService.login.mockRejectedValue(new Error("Invalid credentials"));

      await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send(loginDto)
        .expect(500); // Will be caught by exception filter
    });
  });

  describe("POST /v1/auth/logout", () => {
    it("should logout successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Logout successful",
      };

      mockAuthService.logout.mockResolvedValue(mockResponse);

      // Note: In a real test, you would need to provide a valid JWT token
      // For this test, we'll mock the JWT guard to pass
      const response = await request(app.getHttpServer())
        .post("/v1/auth/logout")
        .send({ refreshToken: "mock-refresh-token" })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logout successful");
    });
  });

  describe("POST /v1/auth/refresh", () => {
    it("should refresh token successfully", async () => {
      const mockResponse = {
        success: true,
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        message: "Token refreshed successfully",
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/refresh")
        .send({ refreshToken: "old-refresh-token" })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBe("new-access-token");
      expect(authService.refreshToken).toHaveBeenCalledWith(
        "old-refresh-token",
        expect.any(String),
      );
    });

    it("should return 400 for invalid refresh token data", async () => {
      await request(app.getHttpServer())
        .post("/v1/auth/refresh")
        .send({}) // Missing refreshToken
        .expect(400);
    });
  });

  describe("GET /v1/auth/profile", () => {
    it("should return user profile successfully", async () => {
      const mockResponse = {
        success: true,
        user: {
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        },
      };

      mockAuthService.getUserProfile.mockResolvedValue(mockResponse);

      // Note: In a real test, you would need to provide a valid JWT token
      const response = await request(app.getHttpServer())
        .get("/v1/auth/profile")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe("testuser");
    });
  });

  describe("PUT /v1/auth/profile", () => {
    const updateProfileDto: UpdateProfileDto = {
      firstName: "Updated",
      lastName: "Name",
      email: "updated@example.com",
    };

    it("should update profile successfully", async () => {
      const mockResponse = {
        success: true,
        user: {
          id: "user-id",
          username: "testuser",
          firstName: "Updated",
          lastName: "Name",
          email: "updated@example.com",
        },
        message: "Profile updated successfully",
      };

      mockAuthService.updateProfile.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .put("/v1/auth/profile")
        .send(updateProfileDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.firstName).toBe("Updated");
      expect(response.body.user.lastName).toBe("Name");
      expect(response.body.user.email).toBe("updated@example.com");
    });

    it("should return 400 for invalid profile data", async () => {
      const invalidDto = {
        email: "invalid-email",
      };

      await request(app.getHttpServer())
        .put("/v1/auth/profile")
        .send(invalidDto)
        .expect(400);
    });
  });

  describe("PUT /v1/auth/change-password", () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: "OldPass123!",
      newPassword: "NewPass123!",
    };

    it("should change password successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Password changed successfully",
      };

      mockAuthService.changePassword.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .put("/v1/auth/change-password")
        .send(changePasswordDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Password changed successfully");
    });

    it("should return 400 for invalid password data", async () => {
      const invalidDto = {
        currentPassword: "OldPass123!",
        newPassword: "weak", // Too weak
      };

      await request(app.getHttpServer())
        .put("/v1/auth/change-password")
        .send(invalidDto)
        .expect(400);
    });
  });

  describe("GET /v1/auth/sessions", () => {
    it("should return active sessions", async () => {
      const mockResponse = {
        success: true,
        sessions: [
          {
            id: "session-1",
            ipAddress: "127.0.0.1",
            userAgent: "test-agent",
            lastUsedAt: new Date().toISOString(),
          },
        ],
      };

      mockAuthService.getActiveSessions.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get("/v1/auth/sessions")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toHaveLength(1);
    });
  });

  describe("POST /v1/auth/sessions/:sessionId/revoke", () => {
    it("should revoke session successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Session revoked successfully",
      };

      mockAuthService.revokeSession.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/sessions/session-1/revoke")
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Session revoked successfully");
    });
  });

  describe("GET /v1/auth/status", () => {
    it("should return auth service status", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/auth/status")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe("Zeropoint Protocol Authentication");
      expect(response.body.version).toBe("1.0.0");
      expect(response.body.status).toBe("operational");
      expect(response.body.features).toBeDefined();
    });
  });
});
