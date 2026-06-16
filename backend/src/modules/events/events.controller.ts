import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Request as ExpressRequest } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista eventos publicamente com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de eventos retornada' })
  async findAll(@Query() dto: ListEventsQueryDto) {
    return this.eventsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca detalhes de um evento publicamente' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria evento como ADMIN da cidade' })
  @ApiResponse({ status: 201, description: 'Evento criado' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão' })
  @ApiResponse({ status: 404, description: 'Local não encontrado' })
  async create(@Body() dto: CreateEventDto, @Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.eventsService.create(dto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza evento parcialmente como ADMIN da cidade',
  })
  @ApiResponse({ status: 200, description: 'Evento atualizado' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Evento de outra cidade' })
  @ApiResponse({ status: 404, description: 'Evento ou local não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.eventsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleta evento como ADMIN da cidade' })
  @ApiResponse({ status: 200, description: 'Evento deletado' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Evento de outra cidade' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Evento possui dados vinculados e não pode ser deletado',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.eventsService.remove(id, user);
  }
}
