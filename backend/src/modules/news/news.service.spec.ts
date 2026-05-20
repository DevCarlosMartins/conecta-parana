import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../config/prisma.service';
import { NewsService } from './news.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  client: {
    news: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
};

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    jest.clearAllMocks();
  });

  // --------------------- // findAll // ---------------------
  describe('findAll', () => {
    it('sem filtros, busca com where vazio', async () => {
      mockPrisma.client.news.findMany.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(mockPrisma.client.news.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([]);
    });

    it('com cityId no filtro, repassa para o where', async () => {
      mockPrisma.client.news.findMany.mockResolvedValue([]);

      await service.findAll({ cityId: 5 });

      expect(mockPrisma.client.news.findMany).toHaveBeenCalledWith({
        where: { cityId: 5 },
        orderBy: { id: 'desc' },
      });
    });

    it('com múltiplos filtros, repassa todos', async () => {
      mockPrisma.client.news.findMany.mockResolvedValue([]);

      await service.findAll({
        cityId: 1,
        isActive: true,
        type: 'evento',
        linkType: 'interno',
      });

      expect(mockPrisma.client.news.findMany).toHaveBeenCalledWith({
        where: {
          cityId: 1,
          isActive: true,
          type: 'evento',
          linkType: 'interno',
        },
        orderBy: { id: 'desc' },
      });
    });
  });

  // --------------------- // findOne // ---------------------
  describe('findOne', () => {
    it('retorna a notícia se encontrada', async () => {
      const news = { id: 1, title: 'título', cityId: 1 };
      mockPrisma.client.news.findUniqueOrThrow.mockResolvedValue(news);

      const result = await service.findOne(1);

      expect(result).toEqual(news);
    });

    it('lança NotFoundException se não encontrada', async () => {
      mockPrisma.client.news.findUniqueOrThrow.mockRejectedValue(
        new Error('not found'),
      );
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // --------------------- // create // ---------------------
  describe('create', () => {
    const dto = {
      title: 'Nova',
      description: 'Descrição mínima',
      type: 'evento',
      linkType: 'interno',
      isActive: true,
    };

    it('admin com cityId cria notícia injetando cityId do JWT', async () => {
      mockPrisma.client.news.create.mockResolvedValue({
        id: 1,
        ...dto,
        cityId: 5,
      });

      await service.create(dto, 5);

      expect(mockPrisma.client.news.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          type: dto.type,
          linkType: dto.linkType,
          isActive: true,
          cityId: 5,
        },
      });
    });

    it('respeita isActive=false explícito', async () => {
      mockPrisma.client.news.create.mockResolvedValue({});

      await service.create({ ...dto, isActive: false }, 5);

      expect(mockPrisma.client.news.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          type: dto.type,
          linkType: dto.linkType,
          isActive: false,
          cityId: 5,
        },
      });
    });

    it('admin com cityId null lança ForbiddenException', async () => {
      await expect(service.create(dto, null)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.client.news.create).not.toHaveBeenCalled();
    });
  });

  // --------------------- // update // ---------------------

  describe('update', () => {
    it('admin da mesma cidade atualiza com sucesso', async () => {
      mockPrisma.client.news.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        cityId: 5,
      });
      mockPrisma.client.news.update.mockResolvedValue({ id: 1, title: 'novo' });

      const result = await service.update(1, { title: 'novo' }, 5);

      expect(mockPrisma.client.news.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'novo' },
      });
      expect(result).toEqual({ id: 1, title: 'novo' });
    });

    it('admin de outra cidade lança ForbiddeException', async () => {
      mockPrisma.client.news.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        cityId: 10,
      });

      await expect(service.update(1, { title: 'novo' }, 20)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockPrisma.client.news.update).not.toHaveBeenCalled();
    });

    it('news inexistente lança NotFoundException', async () => {
      mockPrisma.client.news.findUniqueOrThrow.mockRejectedValue(new Error());

      await expect(service.update(999, { title: 'título' }, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --------------------- // delete // ---------------------
  describe('remove', () => {
    it('admin da mesma cidade deleta com sucesso', async () => {
      mockPrisma.client.news.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        cityId: 5,
      });
      mockPrisma.client.news.delete.mockResolvedValue({ id: 1 });

      await service.remove(1, 5);

      expect(mockPrisma.client.news.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('admin de outra cidade lança ForbiddenException', async () => {
      mockPrisma.client.news.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        cityId: 10,
      });

      await expect(service.remove(1, 20)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.client.news.delete).not.toHaveBeenCalled();
    });
  });
});
