import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { CreateNotificationsDto } from './dto/create-notifications.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista das notificações' })
  @ApiResponse({
    status: 200,
    description: 'lista de notifiacoes retoranda com sucesso',
  })
  async findAll(@Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.notificationService.findAll(user.sub);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: ' busca notifiacacoes nao lidas' })
  @ApiResponse({ status: 200, description: ' notificacao encontrada' })
  @ApiResponse({
    status: 404,
    description: 'voce nao tem notificacoes no momento',
  })
  async getUnreadCount(@Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.notificationService.getUnreadCount(user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'cria notificacao (admin da cidade)' })
  @ApiResponse({ status: 201, description: 'Notificacao criada' })
  @ApiResponse({ status: 400, description: 'Body invalido' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  async create(@Body() dto: CreateNotificationsDto) {
    return this.notificationService.create(dto);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Notificacao atualizada' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({ status: 404, description: 'Nao ha notificacoes' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.notificationService.markAsRead(id, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Notificacao lida' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({ status: 404, description: 'Nao ha notificacoes' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.notificationService.remove(id, user.sub);
  }
}
