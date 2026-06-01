import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { LocalsService } from './locals.service';

const mockPrisma = {
  client: {
    local: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
};

const baseLocal = {
  id: 1,
  name: 'Catedral',
  description: 'descrição do local',
  address: 'Praça da Catedral, s/n',
  phone: '0000',
  cityId: 10,
  categoryId: 2,
  userId: 5,
};

const baseDto = {
  name: 'Catedral',
  description: 'descrição do local',
  address: 'Praça da Catedral, s/n',
  phone: '0000',
  categoryId: 2,
};

describe('LocalsService', () => {
  let service: LocalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LocalsService>(LocalsService);
    jest.clearAllMocks();
    mockPrisma.client.$queryRaw.mockResolvedValue([]);
  });

  // --------------------- // findAll // ---------------------
  describe('findAll', () => {
    it('sem filtros, busca com where vazio', async () => {
      mockPrisma.client.local.findMany.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(mockPrisma.client.local.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true, city: true },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([]);
    });

    it('com cityId e categoryId, repassa para o where', async () => {
      mockPrisma.client.local.findMany.mockResolvedValue([]);

      await service.findAll({ cityId: 1, categoryId: 2 });

      expect(mockPrisma.client.local.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { cityId: 1, categoryId: 2 } }),
      );
    });

    it('resolve coordinates de cada local pelo batch', async () => {
      mockPrisma.client.local.findMany.mockResolvedValue([{ ...baseLocal }]);
      mockPrisma.client.$queryRaw.mockResolvedValue([
        { id: 1, lat: -23.4, lng: -51.9 },
      ]);

      const result = await service.findAll({});

      expect(result[0]).toMatchObject({
        id: 1,
        coordinates: { lat: -23.4, lng: -51.9 },
      });
    });

    it('coordinates null quando o local não tem ponto', async () => {
      mockPrisma.client.local.findMany.mockResolvedValue([{ ...baseLocal }]);
      mockPrisma.client.$queryRaw.mockResolvedValue([
        { id: 1, lat: null, lng: null },
      ]);

      const result = await service.findAll({});

      expect(result[0].coordinates).toBeNull();
    });
  });

  // --------------------- // findOne // ---------------------
  describe('findOne', () => {
    it('retorna o local com coordinates quando existe', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        category: {},
        city: {},
        photos: [],
        events: [],
      });
      mockPrisma.client.$queryRaw.mockResolvedValue([
        { lat: -23.4, lng: -51.9 },
      ]);

      const result = await service.findOne(1);

      expect(result).toMatchObject({
        id: 1,
        coordinates: { lat: -23.4, lng: -51.9 },
      });
    });

    it('retorna coordinates null quando não há ponto', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        category: {},
        city: {},
        photos: [],
        events: [],
      });
      mockPrisma.client.$queryRaw.mockResolvedValue([{ lat: null, lng: null }]);

      const result = await service.findOne(1);

      expect(result.coordinates).toBeNull();
    });

    it('lança NotFoundException quando não encontrado', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // --------------------- // create // ---------------------
  describe('create', () => {
    it('cria injetando cityId/userId e grava coordinates', async () => {
      mockPrisma.client.category.findUnique.mockResolvedValue({
        id: 2,
        name: 'X',
        icon: 'i',
      });
      mockPrisma.client.local.create.mockResolvedValue({ ...baseLocal });
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        category: {},
        city: {},
        photos: [],
        events: [],
      });
      mockPrisma.client.$queryRaw.mockResolvedValue([
        { lat: -23.4, lng: -51.9 },
      ]);

      await service.create(
        { ...baseDto, coordinates: { lat: -23.4, lng: -51.9 } },
        10,
        5,
      );

      expect(mockPrisma.client.local.create).toHaveBeenCalledWith({
        data: {
          name: baseDto.name,
          description: baseDto.description,
          address: baseDto.address,
          phone: baseDto.phone,
          cityId: 10,
          categoryId: 2,
          userId: 5,
        },
      });
      expect(mockPrisma.client.$executeRaw).toHaveBeenCalled();
    });

    it('cria sem gravar coordinates quando não enviado', async () => {
      mockPrisma.client.category.findUnique.mockResolvedValue({ id: 2 });
      mockPrisma.client.local.create.mockResolvedValue({ ...baseLocal });
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        category: {},
        city: {},
        photos: [],
        events: [],
      });

      await service.create({ ...baseDto }, 10, 5);

      expect(mockPrisma.client.$executeRaw).not.toHaveBeenCalled();
    });

    it('lança ForbiddenException se admin não tem cidade (cityId null)', async () => {
      await expect(service.create({ ...baseDto }, null, 5)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.client.local.create).not.toHaveBeenCalled();
    });

    it('lança BadRequestException se categoria não existe', async () => {
      mockPrisma.client.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ ...baseDto, categoryId: 999 }, 10, 5),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.client.local.create).not.toHaveBeenCalled();
    });
  });

  // --------------------- // update // ---------------------
  describe('update', () => {
    it('admin da mesma cidade atualiza sem coordinates', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 10,
        category: {},
        city: {},
        photos: [],
        events: [],
      });
      mockPrisma.client.local.update.mockResolvedValue({ ...baseLocal });

      await service.update(1, { name: 'novo' }, 10);

      expect(mockPrisma.client.local.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'novo' },
      });
      expect(mockPrisma.client.$executeRaw).not.toHaveBeenCalled();
    });

    it('grava coordinates quando enviado no update', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 10,
        category: {},
        city: {},
        photos: [],
        events: [],
      });
      mockPrisma.client.local.update.mockResolvedValue({ ...baseLocal });

      await service.update(1, { coordinates: { lat: -23.4, lng: -51.9 } }, 10);

      expect(mockPrisma.client.$executeRaw).toHaveBeenCalled();
    });

    it('valida categoria quando categoryId é enviado', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 10,
        category: {},
        city: {},
        photos: [],
        events: [],
      });
      mockPrisma.client.category.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { categoryId: 999 }, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lança ForbiddenException ao editar local de outra cidade', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 99,
      });

      await expect(service.update(1, { name: 'novo' }, 10)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.client.local.update).not.toHaveBeenCalled();
    });

    it('lança NotFoundException se o local não existe', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'novo' }, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --------------------- // remove // ---------------------
  describe('remove', () => {
    it('admin da mesma cidade remove sem dependências', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 10,
        _count: { events: 0 },
      });
      mockPrisma.client.local.delete.mockResolvedValue({ ...baseLocal });

      const result = await service.remove(1, 10);

      expect(mockPrisma.client.local.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ id: 1, deleted: true });
    });

    it('lança ConflictException quando há eventos vinculados', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 10,
        _count: { events: 3 },
      });

      await expect(service.remove(1, 10)).rejects.toThrow(ConflictException);
      expect(mockPrisma.client.local.delete).not.toHaveBeenCalled();
    });

    it('lança ForbiddenException ao remover local de outra cidade', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue({
        ...baseLocal,
        cityId: 99,
        _count: { events: 0 },
      });

      await expect(service.remove(1, 10)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.client.local.delete).not.toHaveBeenCalled();
    });

    it('lança NotFoundException se o local não existe', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValue(null);

      await expect(service.remove(999, 10)).rejects.toThrow(NotFoundException);
    });
  });
});
