var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JWT_AUDIENCE, JWT_ISSUER, JWT_TTL_SECONDS, readAuthConfig } from './auth.config';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            DatabaseModule,
            JwtModule.registerAsync({
                useFactory: () => ({
                    secret: readAuthConfig().secret,
                    signOptions: { algorithm: 'HS256', expiresIn: JWT_TTL_SECONDS, issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
                }),
            }),
            ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
        ],
        controllers: [AuthController],
        providers: [AuthService, JwtAuthGuard],
        exports: [JwtAuthGuard, JwtModule, AuthService, ThrottlerModule],
    })
], AuthModule);
export { AuthModule };
