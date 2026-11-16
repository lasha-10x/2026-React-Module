var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { JWT_AUDIENCE, JWT_ISSUER } from './auth.config';
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-shop-session' : 'shop-session';
let JwtAuthGuard = class JwtAuthGuard {
    jwt;
    auth;
    constructor(jwt, auth) {
        this.jwt = jwt;
        this.auth = auth;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Cookie requests require a custom header. CORS does not allow it cross-origin.
        const cookie = request.headers['x-shop-session'] === 'browser'
            ? request.headers.cookie?.split(';').find((entry) => entry.trim().startsWith(`${SESSION_COOKIE}=`))?.trim().slice(SESSION_COOKIE.length + 1)
            : undefined;
        const header = request.headers.authorization ?? (cookie ? `Bearer ${cookie}` : undefined);
        if (typeof header !== 'string' || header.length > 4096)
            throw new UnauthorizedException('Unauthorized');
        const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(header);
        if (!match)
            throw new UnauthorizedException('Unauthorized');
        let userId;
        try {
            const claims = await this.jwt.verifyAsync(match[1], {
                algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE,
            });
            if (typeof claims.sub !== 'string' || !isUUID(claims.sub)
                || (claims.role !== 'USER' && claims.role !== 'ADMIN')
                || typeof claims.exp !== 'number' || !Number.isSafeInteger(claims.exp)) {
                throw new Error('Invalid token claims');
            }
            userId = claims.sub;
            request.expiresAt = claims.exp * 1000;
        }
        catch {
            throw new UnauthorizedException('Unauthorized');
        }
        // The database is authoritative: deleted users and stale role claims are not trusted.
        request.user = await this.auth.currentUser(userId);
        return true;
    }
};
JwtAuthGuard = __decorate([
    Injectable()
], JwtAuthGuard);
export { JwtAuthGuard };
