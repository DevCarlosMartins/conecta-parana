import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './config/prisma.module';
import { RedisCacheModule } from './config/redis-cache.module';
import { envValidationSchema } from './config/env.validation';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { PinoLoggerModule } from './config/logger.module';
import { NewsModule } from './modules/news/news.module';
import { LocalsModule } from './modules/locals/locals.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CitiesModule } from './modules/cities/cities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventsModule } from './modules/events/events.module';
import { ComunicadosModule } from './modules/comunicados/comunicados.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') ?? 60000,
          limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
        },
      ],
    }),
    PinoLoggerModule,
    PrismaModule,
    AuthModule,
    AdminModule,
    RedisCacheModule,
    NewsModule,
    LocalsModule,
    CategoriesModule,
    CitiesModule,
    NotificationsModule,
    EventsModule,
    ComunicadosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD as string,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}