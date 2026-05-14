import { Module } from '@nestjs/common';
import { PrismaModule } from '../../config/prisma.module';
import { ComunicadoController } from './comunicados.controller';
import { ComunicadoService } from './comunicados.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ComunicadoController],
  providers: [ComunicadoService],
})
export class ComunicadoModule {}
