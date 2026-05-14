import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ListComunicadoQueryDto } from './dto/list-comunicado-query.dto';
import { Prisma } from '@prisma/client';
import { CreateComunicadoDto } from './dto/create-comunicado.dto';
import { UpdateComunicadoDto } from './dto/update-comunicado.dto';

@Injectable()
export class ComunicadoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListComunicadoQueryDto) {
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

  async create(dto: CreateComunicadoDto) {
    return this.prisma.client.comunicado.create({
      data: {
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateComunicadoDto) {
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
