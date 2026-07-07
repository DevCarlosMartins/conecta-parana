import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { ListLocalsQueryDto } from './dto/list-locals-query.dto';

type Coordinates = { lat: number; lng: number };

@Injectable()
export class LocalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListLocalsQueryDto) {
    const where: Prisma.LocalWhereInput = {};
    if (query.cityId !== undefined) where.cityId = query.cityId;
    if (query.categoryId !== undefined) where.categoryId = query.categoryId;

    const locals = await this.prisma.client.local.findMany({
      where,
      include: { category: true, city: true },
      orderBy: { id: 'desc' },
    });

    const coordsById = await this.readCoordinatesBatch(locals.map((l) => l.id));
    return locals.map((l) => ({
      ...l,
      coordinates: coordsById.get(l.id) ?? null,
    }));
  }

  async findOne(id: number) {
    const local = await this.prisma.client.local.findUnique({
      where: { id },
      include: { category: true, city: true, photos: true, events: true },
    });
    if (!local) throw new NotFoundException(`Local ${id} não encontrado`);

    const coordinates = await this.readCoordinates(id);
    return { ...local, coordinates };
  }

  async create(dto: CreateLocalDto, cityId: number | null, userId: number) {
    const resolvedCityId = this.resolveCityId(cityId, dto.cityId);
    await this.assertCategoryExists(dto.categoryId);

    const local = await this.prisma.client.local.create({
      data: {
        name: dto.name,
        description: dto.description,
        address: dto.address,
        phone: dto.phone,
        cityId: resolvedCityId,
        categoryId: dto.categoryId,
        userId,
      },
    });

    if (dto.coordinates) {
      await this.writeCoordinates(local.id, dto.coordinates);
    }

    return this.findOne(local.id);
  }

  async update(id: number, dto: UpdateLocalDto, cityId: number | null) {
    const local = await this.prisma.client.local.findUnique({ where: { id } });
    if (!local) throw new NotFoundException(`Local ${id} não encontrado`);

    if (cityId !== null && cityId !== undefined) {
      if (local.cityId !== cityId) {
        throw new ForbiddenException(
          'Você só pode editar locais da sua cidade',
        );
      }
    }

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const { coordinates, ...scalarFields } = dto;
    await this.prisma.client.local.update({
      where: { id },
      data: scalarFields,
    });

    if (coordinates !== undefined) {
      await this.writeCoordinates(id, coordinates);
    }

    return this.findOne(id);
  }

  async remove(id: number, cityId: number | null) {
    const local = await this.prisma.client.local.findUnique({
      where: { id },
      include: { _count: { select: { events: true, photos: true } } },
    });

    if (!local) throw new NotFoundException(`Local ${id} não encontrado`);

    if (cityId !== null && cityId !== undefined) {
      if (local.cityId !== cityId) {
        throw new ForbiddenException(
          'Você só pode excluir locais da sua cidade',
        );
      }
    }

    if (local._count.events > 0 || local._count.photos > 0) {
      throw new ConflictException(
        'Não é possível excluir este local, pois existem eventos ou fotos vinculados a ele',
      );
    }

    await this.prisma.client.local.delete({ where: { id } });
    return { id, deleted: true };
  }

  private resolveCityId(
    tokenCityId: number | null,
    dtoCityId: number | undefined,
  ): number {
    if (tokenCityId !== null && tokenCityId !== undefined) return tokenCityId;
    if (dtoCityId !== undefined) return dtoCityId;
    throw new ForbiddenException(
      'Superadmin deve informar cityId no body para criar locais',
    );
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.client.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Categoria ${categoryId} não existe`);
    }
  }

  private async writeCoordinates(id: number, c: Coordinates): Promise<void> {
    await this.prisma.client.$executeRaw`
      UPDATE locals
      SET coordinates = ST_SetSRID(ST_MakePoint(${c.lng}, ${c.lat}), 4326)
      WHERE id = ${id}
    `;
  }

  private async readCoordinates(id: number): Promise<Coordinates | null> {
    const rows = await this.prisma.client.$queryRaw<
      { lat: number | null; lng: number | null }[]
    >`
      SELECT ST_Y(coordinates) AS lat, ST_X(coordinates) AS lng
      FROM locals WHERE id = ${id}
    `;
    const row = rows[0];
    if (!row || row.lat === null || row.lng === null) return null;
    return { lat: Number(row.lat), lng: Number(row.lng) };
  }

  private async readCoordinatesBatch(
    ids: number[],
  ): Promise<Map<number, Coordinates>> {
    const map = new Map<number, Coordinates>();
    if (ids.length === 0) return map;
    const rows = await this.prisma.client.$queryRaw<
      { id: number; lat: number | null; lng: number | null }[]
    >`
      SELECT id, ST_Y(coordinates) AS lat, ST_X(coordinates) AS lng
      FROM locals WHERE id IN (${Prisma.join(ids)})
    `;
    for (const r of rows) {
      if (r.lat !== null && r.lng !== null) {
        map.set(r.id, { lat: Number(r.lat), lng: Number(r.lng) });
      }
    }
    return map;
  }
}
