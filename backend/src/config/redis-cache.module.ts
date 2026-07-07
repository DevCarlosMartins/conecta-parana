import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>(
          'REDIS_URL',
          'redis://localhost:6379',
        );

        const keyv = createKeyv({
          url: redisUrl,
          socket: {
            family: 0, // dual-stack IPv4/IPv6 - necessário no Railway
            connectTimeout: 5000,
          },
        });

        keyv.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        return {
          stores: [keyv],
          ttl: 30_000,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
