var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsEmail, MaxLength, IsOptional, IsArray } from 'class-validator';
import { IsStrongPassword, IsValidUsername } from '../decorators/validation.decorators.js';
export class RegisterDto {
}
__decorate([
    IsValidUsername(),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    IsStrongPassword(),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
export class LoginDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
export class RefreshTokenDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
export class ChangePasswordDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    IsStrongPassword(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
export class UpdateProfileDto {
}
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "firstName", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "lastName", void 0);
__decorate([
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "email", void 0);
export class UpdatePreferencesDto {
}
__decorate([
    IsOptional(),
    __metadata("design:type", Object)
], UpdatePreferencesDto.prototype, "preferences", void 0);
export class AssignRolesDto {
}
__decorate([
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], AssignRolesDto.prototype, "roles", void 0);
export class VerifyEmailDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);
export class ForgotPasswordDto {
}
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
export class ResetPasswordDto {
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    IsStrongPassword(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map