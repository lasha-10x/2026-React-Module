var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
let PrismaService = class PrismaService extends PrismaClient {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString)
            throw new Error('Set DATABASE_URL in backend/.env before starting the backend.');
        super({ adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 10_000, max: 5 }) });
    }
    async onModuleInit() {
        try {
            await this.$connect();
            await this.$queryRaw `SELECT 1`;
        }
        catch {
            await this.$disconnect();
            throw new Error('Database connection failed. Check backend/.env and Neon availability.');
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
PrismaService = __decorate([
    Injectable()
], PrismaService);
export { PrismaService };
