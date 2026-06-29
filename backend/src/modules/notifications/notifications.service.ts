import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateNotificationsDto } from './dto/create-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async create(dto: CreateNotificationsDto) {
    if (dto.eventId !== undefined && dto.comunicadoId !== undefined) {
      throw new BadRequestException(
        'Informe apenas eventId ou comunicadoId, não os dois',
      );
    }

    if (dto.eventId !== undefined) {
      await this.assertEventExists(dto.eventId);
    }

    if (dto.comunicadoId !== undefined) {
      await this.assertComunicadoExists(dto.comunicadoId);
    }

    const users = await this.prisma.client.user.findMany({
      where: { role: 'USUARIO' },
      select: { id: true },
    });

    return this.prisma.client.notification.createMany({
      data: users.map((user) => ({
        title: dto.title,
        description: dto.description,
        userId: user.id,
        eventId: dto.eventId,
        comunicadoId: dto.comunicadoId,
      })),
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.client.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.client.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta notificação',
      );
    }

    return this.prisma.client.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async findAllAdmin() {
    const notifications = await this.prisma.client.notification.findMany({
      orderBy: { id: 'desc' },
      distinct: ['title', 'description'],
      select: {
        id: true,
        title: true,
        description: true,
        eventId: true,
        comunicadoId: true,
        isRead: true,
      },
    });
    return notifications;
  }

  async remove(id: number, userId: number) {
    const notification = await this.prisma.client.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover esta notificação',
      );
    }

    return this.prisma.client.notification.delete({
      where: { id },
    });
  }

  private async assertEventExists(eventId: number): Promise<void> {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
  }

  private async assertComunicadoExists(comunicadoId: number): Promise<void> {
    const comunicado = await this.prisma.client.comunicado.findUnique({
      where: { id: comunicadoId },
      select: { id: true },
    });

    if (!comunicado) {
      throw new NotFoundException('Comunicado não encontrado');
    }
  }
}
