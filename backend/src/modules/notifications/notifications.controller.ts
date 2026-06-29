import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateNotificationsDto } from './dto/create-notifications.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todas as notificações criadas (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Notificações retornadas' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAllAdmin() {
    return this.notificationsService.findAllAdmin();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista notificações do usuário logado' })
  @ApiResponse({ status: 200, description: 'Notificações retornadas' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  async findAll(@Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.notificationsService.findAll(user.sub);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Conta notificações não lidas do usuário logado' })
  @ApiResponse({ status: 200, description: 'Contagem retornada' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  async getUnreadCount(@Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria notificações globais para usuários' })
  @ApiResponse({ status: 201, description: 'Notificações criadas' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão' })
  @ApiResponse({
    status: 404,
    description: 'Evento ou comunicado não encontrado',
  })
  async create(@Body() dto: CreateNotificationsDto) {
    return this.notificationsService.create(dto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marca notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Notificação de outro usuário' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove notificação do usuário logado' })
  @ApiResponse({ status: 200, description: 'Notificação removida' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Notificação de outro usuário' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.notificationsService.remove(id, user.sub);
  }
}
