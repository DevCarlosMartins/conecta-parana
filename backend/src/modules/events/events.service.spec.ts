import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { EventsService } from './events.service';

type EventTestResponse = {
  id: number;
  title: string;
  cityId?: number;
  userId?: number;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
};

const expectedEventInclude = {
  city: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      cityId: true,
    },
  },
  local: true,
} satisfies Prisma.EventInclude;

const mockPrisma = {
  client: {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    local: {
      findUnique: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
};

const currentAdmin = {
  sub: 1,
  cityId: 1,
};

const otherCityAdmin = {
  sub: 2,
  cityId: 2,
};

const adminWithoutCity = {
  sub: 3,
  cityId: null,
};

const baseEvent = {
  id: 1,
  title: 'Evento Teste',
  description: 'Descrição do evento teste',
  type: 'cultural',
  status: 'ativo',
  eventDate: new Date('2026-06-17T19:00:00.000Z'),
  cityId: 1,
  userId: 1,
  localId: null,
};

const eventWithRelations = {
  ...baseEvent,
  city: {
    id: 1,
    name: 'Maringá',
    state: 'PR',
  },
  user: {
    id: 1,
    name: 'Admin',
    email: 'admin@test.com',
    role: Role.ADMIN,
    cityId: 1,
  },
  local: null,
};

const createDeleteForeignKeyError = () =>
  new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
    code: 'P2003',
    clientVersion: 'test',
  });

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve listar eventos com filtros e coordinates', async () => {
      mockPrisma.client.event.findMany.mockResolvedValueOnce([
        eventWithRelations,
      ]);

      mockPrisma.client.$queryRaw.mockResolvedValueOnce([
        {
          id: 1,
          lat: -23.4205,
          lng: -51.9333,
        },
      ]);

      const resultUnknown: unknown = await service.findAll({
        cityId: 1,
        type: 'cultural',
        status: 'ativo',
        localId: 1,
      });

      const result = resultUnknown as EventTestResponse[];

      expect(mockPrisma.client.event.findMany).toHaveBeenCalledWith({
        where: {
          cityId: 1,
          type: 'cultural',
          status: 'ativo',
          localId: 1,
        },
        include: expectedEventInclude,
        orderBy: {
          eventDate: 'asc',
        },
      });

      expect(result[0]).toMatchObject({
        id: 1,
        title: 'Evento Teste',
        coordinates: {
          lat: -23.4205,
          lng: -51.9333,
        },
      });
    });

    it('deve listar eventos sem filtros', async () => {
      mockPrisma.client.event.findMany.mockResolvedValueOnce([]);

      const resultUnknown: unknown = await service.findAll({});
      const result = resultUnknown as EventTestResponse[];

      expect(mockPrisma.client.event.findMany).toHaveBeenCalledWith({
        where: {},
        include: expectedEventInclude,
        orderBy: {
          eventDate: 'asc',
        },
      });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar evento por id com coordinates', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(
        eventWithRelations,
      );

      mockPrisma.client.$queryRaw.mockResolvedValueOnce([
        {
          id: 1,
          lat: -23.4205,
          lng: -51.9333,
        },
      ]);

      const resultUnknown: unknown = await service.findOne(1);
      const result = resultUnknown as EventTestResponse;

      expect(mockPrisma.client.event.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expectedEventInclude,
      });

      expect(result).toMatchObject({
        id: 1,
        title: 'Evento Teste',
        coordinates: {
          lat: -23.4205,
          lng: -51.9333,
        },
      });
    });

    it('deve lançar NotFoundException quando evento não existir', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      title: 'Evento Criado',
      description: 'Descrição do evento criado',
      type: 'cultural',
      status: 'ativo',
      eventDate: '2026-06-17T19:00:00.000Z',
      coordinates: {
        lat: -23.4205,
        lng: -51.9333,
      },
    };

    it('deve criar evento usando cityId e userId do JWT', async () => {
      mockPrisma.client.event.create.mockResolvedValueOnce(baseEvent);
      mockPrisma.client.$executeRaw.mockResolvedValueOnce(1);

      mockPrisma.client.event.findUnique.mockResolvedValueOnce(
        eventWithRelations,
      );

      mockPrisma.client.$queryRaw.mockResolvedValueOnce([
        {
          id: 1,
          lat: -23.4205,
          lng: -51.9333,
        },
      ]);

      const resultUnknown: unknown = await service.create(dto, currentAdmin);
      const result = resultUnknown as EventTestResponse;

      expect(mockPrisma.client.event.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          type: dto.type,
          status: dto.status,
          eventDate: new Date(dto.eventDate),
          cityId: currentAdmin.cityId,
          userId: currentAdmin.sub,
          localId: undefined,
        },
      });

      expect(mockPrisma.client.$executeRaw).toHaveBeenCalled();
      expect(result.title).toBe('Evento Teste');
    });

    it('deve lançar ForbiddenException se admin não tiver cityId', async () => {
      await expect(service.create(dto, adminWithoutCity)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar NotFoundException se local não existir', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create({ ...dto, localId: 99 }, currentAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se local for de outra cidade', async () => {
      mockPrisma.client.local.findUnique.mockResolvedValueOnce({
        cityId: 2,
      });

      await expect(
        service.create({ ...dto, localId: 1 }, currentAdmin),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('deve atualizar evento da mesma cidade do admin', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(baseEvent);
      mockPrisma.client.event.update.mockResolvedValueOnce({
        ...baseEvent,
        title: 'Evento Atualizado',
      });

      mockPrisma.client.event.findUnique.mockResolvedValueOnce({
        ...eventWithRelations,
        title: 'Evento Atualizado',
      });

      mockPrisma.client.$queryRaw.mockResolvedValueOnce([
        {
          id: 1,
          lat: null,
          lng: null,
        },
      ]);

      const resultUnknown: unknown = await service.update(
        1,
        {
          title: 'Evento Atualizado',
        },
        currentAdmin,
      );

      const result = resultUnknown as EventTestResponse;

      expect(mockPrisma.client.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Evento Atualizado',
        },
      });

      expect(result.title).toBe('Evento Atualizado');
    });

    it('deve lançar NotFoundException ao atualizar evento inexistente', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update(999, { title: 'Teste' }, currentAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException ao atualizar evento de outra cidade', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce({
        ...baseEvent,
        cityId: 2,
      });

      await expect(
        service.update(1, { title: 'Teste' }, currentAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve atualizar coordinates quando enviado no update', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(baseEvent);
      mockPrisma.client.$executeRaw.mockResolvedValueOnce(1);

      mockPrisma.client.event.findUnique.mockResolvedValueOnce(
        eventWithRelations,
      );

      mockPrisma.client.$queryRaw.mockResolvedValueOnce([
        {
          id: 1,
          lat: -23.4205,
          lng: -51.9333,
        },
      ]);

      const resultUnknown: unknown = await service.update(
        1,
        {
          coordinates: {
            lat: -23.4205,
            lng: -51.9333,
          },
        },
        currentAdmin,
      );

      const result = resultUnknown as EventTestResponse;

      expect(mockPrisma.client.event.update).not.toHaveBeenCalled();
      expect(mockPrisma.client.$executeRaw).toHaveBeenCalled();
      expect(result.coordinates).toEqual({
        lat: -23.4205,
        lng: -51.9333,
      });
    });
  });

  describe('remove', () => {
    it('deve deletar evento da mesma cidade do admin', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(baseEvent);
      mockPrisma.client.event.delete.mockResolvedValueOnce(baseEvent);

      const result = await service.remove(1, currentAdmin);

      expect(mockPrisma.client.event.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toEqual(baseEvent);
    });

    it('deve lançar NotFoundException ao deletar evento inexistente', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(999, currentAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException ao deletar evento de outra cidade', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce({
        ...baseEvent,
        cityId: otherCityAdmin.cityId,
      });

      await expect(service.remove(1, currentAdmin)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ConflictException quando evento tiver dados vinculados', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValueOnce(baseEvent);
      mockPrisma.client.event.delete.mockRejectedValueOnce(
        createDeleteForeignKeyError(),
      );

      await expect(service.remove(1, currentAdmin)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
