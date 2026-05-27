import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ListComunicadosQueryDto } from './dto/list-comunicados-query.dto';
import { Prisma } from '@prisma/client';
import { CreateComunicadosDto } from './dto/create-comunicados.dto';
import { UpdateComunicadosDto } from './dto/update-comunicados.dto';

@Injectable()
export class ComunicadosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListComunicadosQueryDto) {
    const where: Prisma.ComunicadoWhereInput = {};
    if (dto.isActive !== undefined) where.isActive = dto.isActive;

    return this.prisma.client.comunicado.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    try {
      return await this.prisma.client.comunicado.findUniqueOrThrow({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`comunicado ${id} nao encontrada`);
    }
  }

  async create(dto: CreateComunicadosDto) {
    return this.prisma.client.comunicado.create({
      data: {
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateComunicadosDto) {
    await this.findOne(id);

    return this.prisma.client.comunicado.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.comunicado.delete({
      where: { id },
    });
  }
}
