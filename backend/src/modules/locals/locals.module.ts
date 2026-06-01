import { Module } from '@nestjs/common';
import { PrismaModule } from '../../config/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LocalsController } from './locals.controller';
import { LocalsService } from './locals.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LocalsController],
  providers: [LocalsService],
})
export class LocalsModule {}
