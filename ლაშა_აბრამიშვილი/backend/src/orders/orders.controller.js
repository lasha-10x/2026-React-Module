var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
let OrdersController = class OrdersController {
    orders;
    constructor(orders) {
        this.orders = orders;
    }
    create(request, input) {
        return this.orders.create(this.userId(request), input);
    }
    list(request) { return this.orders.list(this.userId(request)); }
    find(request, id) {
        return this.orders.find(this.userId(request), id);
    }
    userId(request) {
        if (!request.user)
            throw new UnauthorizedException('Unauthorized');
        return request.user.id;
    }
};
__decorate([
    Post(),
    Header('Cache-Control', 'no-store'),
    UseGuards(ThrottlerGuard),
    Throttle({ default: { limit: 10, ttl: 60_000 } }),
    __param(0, Req()),
    __param(1, Body())
], OrdersController.prototype, "create", null);
__decorate([
    Get(),
    Header('Cache-Control', 'no-store'),
    __param(0, Req())
], OrdersController.prototype, "list", null);
__decorate([
    Get(':id'),
    Header('Cache-Control', 'no-store'),
    __param(0, Req()),
    __param(1, Param('id', new ParseUUIDPipe()))
], OrdersController.prototype, "find", null);
OrdersController = __decorate([
    Controller('orders'),
    UseGuards(JwtAuthGuard)
], OrdersController);
export { OrdersController };
