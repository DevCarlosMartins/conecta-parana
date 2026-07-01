import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { ListComunicadosQueryDto } from './dto/list-comunicados-query.dto';
import { CreateComunicadosDto } from './dto/create-comunicados.dto';
import { UpdateComunicadosDto } from './dto/update-comunicados.dto';

@Injectable()
export class ComunicadosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListComunicadosQueryDto) {
    const where: Prisma.ComunicadoWhereInput = {};

    if (dto.isActive !== undefined) {
      where.isActive = dto.isActive;
    }

    return this.prisma.client.comunicado.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const comunicado = await this.prisma.client.comunicado.findUnique({
      where: { id },
    });

    if (!comunicado) {
      throw new NotFoundException(`Comunicado ${id} não encontrado`);
    }

    return comunicado;
  }

  async create(dto: CreateComunicadosDto) {
    return this.prisma.client.comunicado.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
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

    try {
      return await this.prisma.client.comunicado.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível deletar o comunicado, pois existem dados vinculados a ele',
        );
      }

      throw error;
    }
  }
}
