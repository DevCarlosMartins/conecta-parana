import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista cidades' })
  @ApiResponse({ status: 200, description: 'Lista de cidades retornada' })
  async findAll() {
    return this.citiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca cidade por ID' })
  @ApiResponse({ status: 200, description: 'Cidade encontrada' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma cidade' })
  @ApiResponse({ status: 201, description: 'Cidade criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão' })
  @ApiResponse({ status: 409, description: 'Cidade já cadastrada' })
  async create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza uma cidade parcialmente' })
  @ApiResponse({ status: 200, description: 'Cidade atualizada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  @ApiResponse({ status: 409, description: 'Cidade já cadastrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCityDto,
  ) {
    return this.citiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleta uma cidade' })
  @ApiResponse({ status: 200, description: 'Cidade deletada' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Cidade possui vínculos e não pode ser deletada',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.remove(id);
  }
}
