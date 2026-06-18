import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from './notifications.service';
import { ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  client: {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
    comunicado: {
      findUnique: jest.fn(),
    },
  },
};

describe('NorificationsService', () => {
  describe('create - validações extras', () => {
    it('lança BadRequestException se informar eventId e comunicadoId juntos', async () => {
      await expect(
        service.create({
          title: 'Novo aviso',
          description: 'Descrição válida da notificação',
          eventId: 1,
          comunicadoId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança NotFoundException se eventId não existir', async () => {
      mockPrisma.client.event.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          title: 'Novo evento',
          description: 'Descrição válida da notificação',
          eventId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException se comunicadoId não existir', async () => {
      mockPrisma.client.comunicado.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          title: 'Novo comunicado',
          description: 'Descrição válida da notificação',
          comunicadoId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('cria notificação vinculada a comunicado', async () => {
      const users = [{ id: 1 }, { id: 2 }];

      mockPrisma.client.comunicado.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.client.user.findMany.mockResolvedValue(users);
      mockPrisma.client.notification.createMany.mockResolvedValue({ count: 2 });

      await service.create({
        title: 'Novo comunicado',
        description: 'Descrição válida da notificação',
        comunicadoId: 1,
      });

      expect(mockPrisma.client.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            title: 'Novo comunicado',
            description: 'Descrição válida da notificação',
            userId: 1,
            eventId: undefined,
            comunicadoId: 1,
          },
          {
            title: 'Novo comunicado',
            description: 'Descrição válida da notificação',
            userId: 2,
            eventId: undefined,
            comunicadoId: 1,
          },
        ],
      });
    });
  });
  describe('markAsRead - permissões extras', () => {
    it('lança ForbiddenException se a notificação for de outro usuário', async () => {
      mockPrisma.client.notification.findUnique.mockResolvedValue({
        id: 1,
        title: 'Notificação',
        description: 'Descrição',
        userId: 2,
        isRead: false,
        eventId: null,
        comunicadoId: null,
      });

      await expect(service.markAsRead(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove - permissões extras', () => {
    it('lança ForbiddenException se a notificação for de outro usuário', async () => {
      mockPrisma.client.notification.findUnique.mockResolvedValue({
        id: 1,
        title: 'Notificação',
        description: 'Descrição',
        userId: 2,
        isRead: false,
        eventId: null,
        comunicadoId: null,
      });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('FindAll', () => {
    it('sem filtro, buca com o where vazio', async () => {
      const notifications = [{ id: 1, userId: 1, title: 'Teste' }];
      mockPrisma.client.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll(1);

      expect(mockPrisma.client.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('Create', () => {
    const dto = {
      title: 'titulo',
      description: 'Descrição minima',
      eventId: 1,
      comunicadoId: undefined,
    };

    it('Cria notificação para todos os usuários', async () => {
      const users = [{ id: 1 }, { id: 2 }];

      mockPrisma.client.event.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.client.user.findMany.mockResolvedValue(users);
      mockPrisma.client.notification.createMany.mockResolvedValue({ count: 2 });

      await service.create(dto);

      expect(mockPrisma.client.user.findMany).toHaveBeenCalledWith({
        where: { role: 'USUARIO' },
        select: { id: true },
      });

      expect(mockPrisma.client.notification.createMany).toHaveBeenCalledWith({
        data: [
          {
            title: dto.title,
            description: dto.description,
            userId: 1,
            eventId: dto.eventId,
            comunicadoId: dto.comunicadoId,
          },
          {
            title: dto.title,
            description: dto.description,
            userId: 2,
            eventId: dto.eventId,
            comunicadoId: dto.comunicadoId,
          },
        ],
      });
    });
  });
  describe('getUnreadCount', () => {
    it('Retorna a contagem de notificação não lida', async () => {
      mockPrisma.client.notification.count.mockResolvedValue(3);
      const result = await service.getUnreadCount(1);
      expect(mockPrisma.client.notification.count).toHaveBeenCalledWith({
        where: { userId: 1, isRead: false },
      });
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('Marca como lidas', async () => {
      mockPrisma.client.notification.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
      });
      mockPrisma.client.notification.update.mockResolvedValue({
        id: 1,
        title: 'novo',
      });
      const result = await service.markAsRead(1, 1);
      expect(mockPrisma.client.notification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isRead: true },
      });
      expect(result).toEqual({ id: 1, title: 'novo' });
    });

    it('Notificação userId incorreto', async () => {
      mockPrisma.client.notification.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
      });
      await expect(service.markAsRead(1, 2)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.client.notification.update).not.toHaveBeenCalled();
    });

    it('Notificação laçada não existe', async () => {
      mockPrisma.client.notification.findUnique.mockRejectedValue(new Error());
      await expect(service.markAsRead(999, 1)).rejects.toThrow(Error);
    });
  });

  describe('Remove notificação', () => {
    it('Admin deleta notificaçaõ com sucesso', async () => {
      mockPrisma.client.notification.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
      });
      mockPrisma.client.notification.delete.mockResolvedValue({ id: 1 });
      await service.remove(1, 1);

      expect(mockPrisma.client.notification.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('Admin não encontra notificação para deletar', async () => {
      mockPrisma.client.notification.findUnique.mockResolvedValue({
        id: 1,
        userId: 10,
      });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.client.notification.delete).not.toHaveBeenCalled();
    });
    it('Notificação não encontrada', async () => {
      mockPrisma.client.notification.findUnique.mockRejectedValue(new Error());
      await expect(service.remove(999, 1)).rejects.toThrow(Error);
    });
  });
});
