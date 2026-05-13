import { Module } from '@nestjs/common';
import { PrismaModule } from '../../config/prisma.module';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
