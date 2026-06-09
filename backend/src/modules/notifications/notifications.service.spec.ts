import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from './notifications.service';
import { ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  client: {
    notification: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
};

describe('NorificationsService', () => {
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
      description: 'decricao minima',
      eventId: 1,
      comunicadoId: 1,
    };

    it('Cria notificacao para todos os usuarios', async () => {
      const users = [{ id: 1 }, { id: 2 }];
      mockPrisma.client.user.findMany.mockResolvedValue(users);
      mockPrisma.client.notification.createMany.mockResolvedValue({ count: 2 });
      await service.create(dto);

      expect(mockPrisma.client.notification.createMany).toHaveBeenCalledWith({
        data: [
          { title: dto.title, description: dto.description, userId: 1 },
          { title: dto.title, description: dto.description, userId: 2 },
        ],
      });
    });
  });
  describe('getUnreadCount', () => {
    it('retorna a contagem de notificacao nao lidas', async () => {
      mockPrisma.client.notification.count.mockResolvedValue(3);
      const result = await service.getUnreadCount(1);
      expect(mockPrisma.client.notification.count).toHaveBeenCalledWith({
        where: { userId: 1, isRead: false },
      });
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('marca como lidas', async () => {
      mockPrisma.client.notification.findUniqueOrThrow.mockResolvedValue({
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

    it('notficacao userId incorreto', async () => {
      mockPrisma.client.notification.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        userId: 1,
      });
      await expect(service.markAsRead(1, 2)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.client.notification.update).not.toHaveBeenCalled();
    });

    it('notificacao lancada nao existe', async () => {
      mockPrisma.client.notification.findUniqueOrThrow.mockRejectedValue(
        new Error(),
      );
      await expect(service.markAsRead(999, 1)).rejects.toThrow(Error);
    });
  });

  describe('remove notificacao', () => {
    it('admin deleta notificacao com sucesso', async () => {
      mockPrisma.client.notification.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        userId: 1,
      });
      mockPrisma.client.notification.delete.mockResolvedValue({ id: 1 });
      await service.remove(1, 1);

      expect(mockPrisma.client.notification.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('admin nao encontra noticia para deletar', async () => {
      mockPrisma.client.notification.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        userId: 10,
      });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.client.notification.delete).not.toHaveBeenCalled();
    });
    it('notificacao nao encontrada', async () => {
      mockPrisma.client.notification.findUniqueOrThrow.mockRejectedValue(
        new Error(),
      );
      await expect(service.remove(999, 1)).rejects.toThrow(Error);
    });
  });
});
