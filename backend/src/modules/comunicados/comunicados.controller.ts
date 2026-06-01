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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ComunicadosService } from './comunicados.service';
import { ListComunicadosQueryDto } from './dto/list-comunicados-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateComunicadosDto } from './dto/create-comunicados.dto';
import { Role } from '@prisma/client';
import { UpdateComunicadosDto } from './dto/update-comunicados.dto';

@ApiTags('comunicados')
@Controller('comunicados')
export class ComunicadosController {
  constructor(private readonly comunicadosService: ComunicadosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista comunicados (público filtros opcionais)' })
  @ApiResponse({ status: 200, description: 'lista retornada com sucesso' })
  async findAll(@Query() dto: ListComunicadosQueryDto) {
    return this.comunicadosService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca detalhes de um comunicado (público)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Comunicado não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comunicadosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crie um comunicado' })
  @ApiResponse({ status: 201, description: 'Comunicado criado' })
  @ApiResponse({ status: 400, description: 'Body inválido' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  async create(@Body() dto: CreateComunicadosDto) {
    return this.comunicadosService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza Comunicado' })
  @ApiResponse({ status: 200, description: 'Comunicado atualizado' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({ status: 404, description: 'Comunicado não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComunicadosDto,
  ) {
    return this.comunicadosService.update(id, dto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleta Comunicados' })
  @ApiResponse({ status: 200, description: 'Comunicado Deletado' })
  @ApiResponse({ status: 401, description: 'Sem token' })
  @ApiResponse({ status: 404, description: 'Comunicado Não Encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.comunicadosService.remove(id);
  }
}
