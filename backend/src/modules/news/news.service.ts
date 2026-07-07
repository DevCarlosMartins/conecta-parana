import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { Prisma } from '@prisma/client';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListNewsQueryDto) {
    const where: Prisma.NewsWhereInput = {};
    if (dto.cityId !== undefined) where.cityId = dto.cityId;
    if (dto.isActive !== undefined) where.isActive = dto.isActive;
    if (dto.type !== undefined) where.type = dto.type;
    if (dto.linkType !== undefined) where.linkType = dto.linkType;

    return this.prisma.client.news.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    try {
      return await this.prisma.client.news.findUniqueOrThrow({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Notícia ${id} não encontrada`);
    }
  }

  async create(dto: CreateNewsDto, adminCityId: number | null) {
    this.assertAdminCityId(adminCityId);

    return this.prisma.client.news.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        linkType: dto.linkType,
        isActive: dto.isActive ?? true,
        cityId: adminCityId,
      },
    });
  }

  async update(id: number, dto: UpdateNewsDto, adminCityId: number | null) {
    this.assertAdminCityId(adminCityId);

    const news = await this.findOne(id);

    if (news.cityId !== adminCityId) {
      throw new ForbiddenException(
        'Não é permitido editar notícias de outra cidade',
      );
    }

    return this.prisma.client.news.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, adminCityId: number | null) {
    this.assertAdminCityId(adminCityId);

    const news = await this.findOne(id);

    if (news.cityId !== adminCityId) {
      throw new ForbiddenException(
        'Não é permitido remover notícias de outra cidade',
      );
    }

    try {
      return await this.prisma.client.news.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível deletar a notícia, pois existem dados vinculados a ela',
        );
      }

      throw error;
    }
  }

  private assertAdminCityId(
    adminCityId: number | null | undefined,
  ): asserts adminCityId is number {
    if (adminCityId === null || adminCityId === undefined) {
      throw new ForbiddenException(
        'Admin sem cidade associada ou token desatualizado, refaça login',
      );
    }
  }
}
