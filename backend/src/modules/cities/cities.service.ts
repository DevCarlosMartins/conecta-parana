import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.city.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const city = await this.prisma.client.city.findUnique({
      where: { id },
    });

    if (!city) {
      throw new NotFoundException('Cidade não encontrada');
    }

    return city;
  }

  async create(dto: CreateCityDto) {
    try {
      return await this.prisma.client.city.create({
        data: {
          name: dto.name,
          state: dto.state,
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Cidade já cadastrada para este estado');
      }

      throw error;
    }
  }

  async update(id: number, dto: UpdateCityDto) {
    await this.findOne(id);

    try {
      return await this.prisma.client.city.update({
        where: { id },
        data: {
          name: dto.name,
          state: dto.state,
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Cidade já cadastrada para este estado');
      }

      throw error;
    }
  }

  async remove(id: number) {
    const city = await this.findOne(id);

    const [usersCount, eventsCount] = await this.prisma.client.$transaction([
      this.prisma.client.user.count({
        where: { cityId: city.id },
      }),
      this.prisma.client.event.count({
        where: { cityId: city.id },
      }),
    ]);

    if (usersCount > 0 || eventsCount > 0) {
      throw new ConflictException(
        'Não é possível deletar a cidade, pois existem usuários ou eventos vinculados a ela',
      );
    }

    return this.prisma.client.city.delete({
      where: { id },
    });
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return (error as { code?: unknown }).code === 'P2002';
  }
}
