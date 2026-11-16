var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Header, HttpCode, Post, Req, Res, ForbiddenException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard, SESSION_COOKIE } from './jwt-auth.guard';
const cookieAttributes = 'Path=/; HttpOnly; SameSite=Strict' + (process.env.NODE_ENV === 'production' ? '; Secure' : '');
let AuthController = class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    register(credentials) { return this.auth.register(credentials); }
    async login(credentials, request, response) {
        const session = await this.auth.login(credentials);
        if (request.headers['x-shop-session'] !== 'browser')
            return session;
        response.setHeader('Set-Cookie', `${SESSION_COOKIE}=${session.accessToken}; ${cookieAttributes}; Max-Age=${session.expiresIn}`);
        return { user: session.user };
    }
    session(request) {
        if (!request.user || !request.expiresAt)
            throw new UnauthorizedException('Unauthorized');
        return { user: request.user, expiresAt: request.expiresAt };
    }
    logout(request, response) {
        if (request.headers['x-shop-session'] !== 'browser')
            throw new ForbiddenException();
        response.setHeader('Set-Cookie', `${SESSION_COOKIE}=; ${cookieAttributes}; Max-Age=0`);
    }
    me(request) {
        if (!request.user)
            throw new UnauthorizedException('Unauthorized');
        return request.user;
    }
};
__decorate([
    Post('register'),
    HttpCode(202),
    Header('Cache-Control', 'no-store'),
    UseGuards(ThrottlerGuard),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    __param(0, Body())
], AuthController.prototype, "register", null);
__decorate([
    Post('login'),
    HttpCode(200),
    Header('Cache-Control', 'no-store'),
    UseGuards(ThrottlerGuard),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true }))
], AuthController.prototype, "login", null);
__decorate([
    Get('session'),
    Header('Cache-Control', 'no-store'),
    UseGuards(JwtAuthGuard),
    __param(0, Req())
], AuthController.prototype, "session", null);
__decorate([
    Post('logout'),
    HttpCode(204),
    Header('Cache-Control', 'no-store'),
    __param(0, Req()),
    __param(1, Res({ passthrough: true }))
], AuthController.prototype, "logout", null);
__decorate([
    Get('me'),
    Header('Cache-Control', 'no-store'),
    UseGuards(JwtAuthGuard),
    __param(0, Req())
], AuthController.prototype, "me", null);
AuthController = __decorate([
    Controller('auth')
], AuthController);
export { AuthController };
