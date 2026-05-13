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
import type { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '@prisma/client';
import { UpdateNewsDto } from './dto/update-news.dto';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista notícias (publico, com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  async findAll(@Query() dto: ListNewsQueryDto) {
    return this.newsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca detalhes de uma notícia (público)' })
  @ApiResponse({ status: 200, description: 'Notícia encontrada' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria notícia (ADMIN da cidade)' })
  @ApiResponse({ status: 201, description: 'Notícia criada' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({
    status: 403,
    description: 'Admin sem cidade ou sem permissão',
  })
  async create(@Body() dto: CreateNewsDto, @Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.newsService.create(dto, user.cityId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza notícia (ADMIN da cidade)' })
  @ApiResponse({ status: 201, description: 'Notícia atualizada' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({ status: 403, description: 'Admin de outra cidade' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.newsService.update(id, dto, user.cityId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleta notícia (ADMIN da cidade)' })
  @ApiResponse({ status: 201, description: 'Notícia deletada' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({ status: 403, description: 'Admin de outra cidade' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.newsService.remove(id, user.cityId);
  }
}
