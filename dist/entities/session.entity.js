var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity.js';
let Session = class Session {
    isExpired() {
        return new Date() > this.expiresAt;
    }
    toJSON() {
        const { token, ...session } = this;
        return session;
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Session.prototype, "id", void 0);
__decorate([
    Column({ length: 255, unique: true }),
    __metadata("design:type", String)
], Session.prototype, "token", void 0);
__decorate([
    Column({ type: 'uuid' }),
    __metadata("design:type", String)
], Session.prototype, "userId", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", User)
], Session.prototype, "user", void 0);
__decorate([
    Column({ length: 45, nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "ipAddress", void 0);
__decorate([
    Column({ length: 500, nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "userAgent", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], Session.prototype, "isActive", void 0);
__decorate([
    Column({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Session.prototype, "expiresAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Session.prototype, "lastUsedAt", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Session.prototype, "createdAt", void 0);
Session = __decorate([
    Entity('sessions'),
    Index(['token'], { unique: true }),
    Index(['userId']),
    Index(['expiresAt'])
], Session);
export { Session };
//# sourceMappingURL=session.entity.js.map