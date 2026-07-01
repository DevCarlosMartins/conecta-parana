import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import type { Request as ExpressRequest } from 'express';
import { Role } from '@prisma/client';
import { LocalsService } from './locals.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { ListLocalsQueryDto } from './dto/list-locals-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('locals')
@Controller('locals')
export class LocalsController {
  constructor(private readonly localsService: LocalsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista locais com filtros opcionais (público)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de locais retornada com sucesso',
  })
  findAll(@Query() query: ListLocalsQueryDto) {
    return this.localsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca detalhes de um local (público)',
  })
  @ApiResponse({ status: 200, description: 'Local encontrado' })
  @ApiResponse({ status: 404, description: 'Local não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.localsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um local (ADMIN)',
  })
  @ApiResponse({ status: 201, description: 'Local criado' })
  @ApiResponse({
    status: 400,
    description: 'Categoria inexistente ou payload inválido',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({
    status: 403,
    description: 'Acesso restrito a administradores',
  })
  create(@Body() dto: CreateLocalDto, @Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.localsService.create(dto, user.cityId, user.sub);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um local parcialmente (ADMIN)',
  })
  @ApiResponse({ status: 200, description: 'Local atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado: local pertence a outra cidade',
  })
  @ApiResponse({ status: 404, description: 'Local não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocalDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.localsService.update(id, dto, user.cityId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Remove um local (ADMIN)',
  })
  @ApiResponse({ status: 200, description: 'Local removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado: local pertence a outra cidade',
  })
  @ApiResponse({ status: 404, description: 'Local não encontrado' })
  @ApiResponse({ status: 409, description: 'Local tem eventos vinculados' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.localsService.remove(id, user.cityId);
  }
}
