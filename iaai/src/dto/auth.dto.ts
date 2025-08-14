// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
} from "class-validator";
import {
  IsStrongPassword,
  IsValidUsername,
} from "../decorators/validation.decorators.js";

export class RegisterDto {
  @IsValidUsername()
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsStrongPassword()
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdatePreferencesDto {
  @IsOptional()
  preferences?: Record<string, any>;
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsStrongPassword()
  newPassword: string;
}
