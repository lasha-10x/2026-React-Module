import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readAuthConfig } from './auth/auth.config';
import { configureApp } from './configure-app';
async function bootstrap() {
    const config = readAuthConfig();
    const app = await NestFactory.create(AppModule);
    configureApp(app, config.origins);
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
