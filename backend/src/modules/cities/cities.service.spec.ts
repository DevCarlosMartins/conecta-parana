import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CitiesService } from './cities.service';

const mockPrisma = {
  client: {
    city: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
};

const createUniqueConstraintError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target: ['name', 'state'] },
  });

const createUnexpectedPrismaError = () =>
  new Prisma.PrismaClientKnownRequestError('Unexpected Prisma error', {
    code: 'P2025',
    clientVersion: 'test',
  });

describe('CitiesService', () => {
  let service: CitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve listar cidades ordenadas por nome ASC', async () => {
      const cities = [
        { id: 1, name: 'Curitiba', state: 'PR' },
        { id: 2, name: 'Maringá', state: 'PR' },
      ];

      mockPrisma.client.city.findMany.mockResolvedValueOnce(cities);

      const result = await service.findAll();

      expect(mockPrisma.client.city.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual(cities);
    });
  });

  describe('findOne', () => {
    it('deve retornar a cidade quando encontrada', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);

      const result = await service.findOne(1);

      expect(mockPrisma.client.city.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(city);
    });

    it('deve lançar NotFoundException quando a cidade não existir', async () => {
      mockPrisma.client.city.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      name: 'Maringá',
      state: 'PR',
    };

    it('deve criar uma cidade com sucesso', async () => {
      const city = { id: 1, ...dto };

      mockPrisma.client.city.create.mockResolvedValueOnce(city);

      const result = await service.create(dto);

      expect(mockPrisma.client.city.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          state: dto.state,
        },
      });
      expect(result).toEqual(city);
    });

    it('deve lançar ConflictException quando a cidade já existir', async () => {
      mockPrisma.client.city.create.mockRejectedValueOnce(
        createUniqueConstraintError(),
      );

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('deve relançar erro inesperado do Prisma ao criar cidade', async () => {
      const error = createUnexpectedPrismaError();

      mockPrisma.client.city.create.mockRejectedValueOnce(error);

      await expect(service.create(dto)).rejects.toThrow(error);
    });

    it('deve relançar erro comum ao criar cidade', async () => {
      const error = new Error('Erro inesperado');

      mockPrisma.client.city.create.mockRejectedValueOnce(error);

      await expect(service.create(dto)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('deve atualizar uma cidade com sucesso', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };
      const updatedCity = { id: 1, name: 'Curitiba', state: 'PR' };

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.city.update.mockResolvedValueOnce(updatedCity);

      const result = await service.update(1, { name: 'Curitiba' });

      expect(mockPrisma.client.city.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.client.city.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Curitiba',
          state: undefined,
        },
      });
      expect(result).toEqual(updatedCity);
    });

    it('deve lançar NotFoundException ao atualizar cidade inexistente', async () => {
      mockPrisma.client.city.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update(999, { name: 'Cidade Teste' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.client.city.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException ao atualizar para cidade duplicada', async () => {
      const city = { id: 1, name: 'Cidade Antiga', state: 'PR' };

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.city.update.mockRejectedValueOnce(
        createUniqueConstraintError(),
      );

      await expect(
        service.update(1, { name: 'Maringá', state: 'PR' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve relançar erro inesperado do Prisma ao atualizar cidade', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };
      const error = createUnexpectedPrismaError();

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.city.update.mockRejectedValueOnce(error);

      await expect(service.update(1, { name: 'Curitiba' })).rejects.toThrow(
        error,
      );
    });

    it('deve relançar erro comum ao atualizar cidade', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };
      const error = new Error('Erro inesperado');

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.city.update.mockRejectedValueOnce(error);

      await expect(service.update(1, { name: 'Curitiba' })).rejects.toThrow(
        error,
      );
    });
  });

  describe('remove', () => {
    it('deve deletar uma cidade sem usuários ou eventos vinculados', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.user.count.mockResolvedValueOnce(0);
      mockPrisma.client.event.count.mockResolvedValueOnce(0);
      mockPrisma.client.$transaction.mockImplementationOnce(
        async (queries: Promise<number>[]) => Promise.all(queries),
      );
      mockPrisma.client.city.delete.mockResolvedValueOnce(city);

      const result = await service.remove(1);

      expect(mockPrisma.client.city.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.client.user.count).toHaveBeenCalledWith({
        where: { cityId: 1 },
      });
      expect(mockPrisma.client.event.count).toHaveBeenCalledWith({
        where: { cityId: 1 },
      });
      expect(mockPrisma.client.city.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(city);
    });

    it('deve lançar NotFoundException ao deletar cidade inexistente', async () => {
      mockPrisma.client.city.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);

      expect(mockPrisma.client.city.delete).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se a cidade tiver usuários vinculados', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.user.count.mockResolvedValueOnce(1);
      mockPrisma.client.event.count.mockResolvedValueOnce(0);
      mockPrisma.client.$transaction.mockImplementationOnce(
        async (queries: Promise<number>[]) => Promise.all(queries),
      );

      await expect(service.remove(1)).rejects.toThrow(ConflictException);

      expect(mockPrisma.client.city.delete).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se a cidade tiver eventos vinculados', async () => {
      const city = { id: 1, name: 'Maringá', state: 'PR' };

      mockPrisma.client.city.findUnique.mockResolvedValueOnce(city);
      mockPrisma.client.user.count.mockResolvedValueOnce(0);
      mockPrisma.client.event.count.mockResolvedValueOnce(1);
      mockPrisma.client.$transaction.mockImplementationOnce(
        async (queries: Promise<number>[]) => Promise.all(queries),
      );

      await expect(service.remove(1)).rejects.toThrow(ConflictException);

      expect(mockPrisma.client.city.delete).not.toHaveBeenCalled();
    });
  });
});
