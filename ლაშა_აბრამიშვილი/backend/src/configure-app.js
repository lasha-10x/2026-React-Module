import { BadRequestException, ValidationPipe } from '@nestjs/common';
export function configureApp(app, origins) {
    app.useGlobalPipes(new ValidationPipe({
        transform: true, whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true,
        validationError: { target: false, value: false },
        exceptionFactory: () => new BadRequestException('Invalid request body.'),
    }));
    app.enableCors({
        origin: origins, credentials: false,
        methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'],
    });
}
