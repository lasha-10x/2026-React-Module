var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OrderStatus } from '../generated/prisma/client';
import { getCatalogProduct } from './catalog';
import { isValidCents } from './money';
const publicOrderSelect = {
    id: true, status: true, currency: true, totalCents: true, createdAt: true, updatedAt: true,
    items: {
        orderBy: { productId: 'asc' },
        select: { id: true, productId: true, title: true, quantity: true, unitPriceCents: true, lineTotalCents: true },
    },
};
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, input) {
        if (new Set(input.items.map((item) => item.productId)).size !== input.items.length) {
            throw new BadRequestException('Each product may appear only once.');
        }
        // All upstream checks finish before opening a database transaction. One deadline bounds the batch.
        const signal = AbortSignal.timeout(10_000);
        const items = await Promise.all(input.items.map(async ({ productId, quantity }) => {
            const product = await getCatalogProduct(productId, signal);
            if (quantity > product.stock)
                throw new ConflictException('Insufficient stock for a requested product.');
            const lineTotalCents = product.unitPriceCents * quantity;
            if (!isValidCents(lineTotalCents))
                throw new BadRequestException('An order line exceeds the monetary limit.');
            return { productId, title: product.title, quantity, unitPriceCents: product.unitPriceCents, lineTotalCents };
        }));
        let totalCents = 0;
        for (const item of items) {
            totalCents += item.lineTotalCents;
            if (!isValidCents(totalCents))
                throw new BadRequestException('The order exceeds the monetary limit.');
        }
        try {
            return await this.prisma.$transaction((tx) => tx.order.create({
                data: { userId, status: OrderStatus.PENDING_PAYMENT, currency: 'USD', totalCents, items: { create: items } },
                select: publicOrderSelect,
            }));
        }
        catch {
            throw new ServiceUnavailableException('The order could not be saved. Please try again later.');
        }
    }
    async list(userId) {
        try {
            return await this.prisma.order.findMany({
                where: { userId }, take: 50, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: publicOrderSelect,
            });
        }
        catch {
            throw new ServiceUnavailableException('Orders are temporarily unavailable.');
        }
    }
    async find(userId, id) {
        let order;
        try {
            order = await this.prisma.order.findFirst({ where: { id, userId }, select: publicOrderSelect });
        }
        catch {
            throw new ServiceUnavailableException('Orders are temporarily unavailable.');
        }
        if (!order)
            throw new NotFoundException('Order not found.');
        return order;
    }
};
OrdersService = __decorate([
    Injectable()
], OrdersService);
export { OrdersService };
