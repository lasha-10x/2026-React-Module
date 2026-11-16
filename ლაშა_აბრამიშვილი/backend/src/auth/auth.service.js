var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { argon2id, hash, verify } from 'argon2';
import { Prisma, Role } from '../generated/prisma/client';
import { JWT_TTL_SECONDS } from './auth.config';
const publicUserSelect = { id: true, email: true, role: true, createdAt: true, updatedAt: true };
const hashOptions = { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };
const registrationMessage = 'Registration request processed. You can try signing in.';
function publicUser(user) {
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt };
}
let AuthService = class AuthService {
    prisma;
    jwt;
    dummyHash = '';
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async onModuleInit() {
        // Unknown emails still perform a real password verification to reduce timing differences.
        this.dummyHash = await hash(randomBytes(32), hashOptions);
    }
    async register(credentials) {
        const passwordHash = await hash(credentials.password, hashOptions);
        try {
            await this.prisma.user.create({
                data: { email: credentials.email, passwordHash, role: Role.USER },
                select: { id: true },
            });
        }
        catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
                throw new ServiceUnavailableException('Authentication service is temporarily unavailable.');
            }
            // A unique-constraint race has the same response as a new registration.
        }
        return { message: registrationMessage };
    }
    async login(credentials) {
        let user;
        try {
            user = await this.prisma.user.findUnique({
                where: { email: credentials.email }, select: { ...publicUserSelect, passwordHash: true },
            });
        }
        catch {
            throw new ServiceUnavailableException('Authentication service is temporarily unavailable.');
        }
        const valid = await verify(user?.passwordHash ?? this.dummyHash, credentials.password).catch(() => false);
        if (!user || !valid)
            throw new UnauthorizedException('Invalid email or password.');
        return {
            accessToken: await this.jwt.signAsync({ sub: user.id, role: user.role }),
            tokenType: 'Bearer', expiresIn: JWT_TTL_SECONDS, user: publicUser(user),
        };
    }
    async currentUser(id) {
        let user;
        try {
            user = await this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
        }
        catch {
            throw new ServiceUnavailableException('Authentication service is temporarily unavailable.');
        }
        if (!user)
            throw new UnauthorizedException('Unauthorized');
        return publicUser(user);
    }
};
AuthService = __decorate([
    Injectable()
], AuthService);
export { AuthService };
