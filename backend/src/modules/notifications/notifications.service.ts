import { ForbiddenException, Injectable } from '@nestjs/common';
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
    const users = await this.prisma.client.user.findMany({
      where: { role: 'USUARIO' },
    });

    return await this.prisma.client.notification.createMany({
      data: users.map((user) => ({
        title: dto.title,
        description: dto.description,
        userId: user.id,
      })),
    });
  }
  async getUnreadCount(userId: number) {
    return await this.prisma.client.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification =
      await this.prisma.client.notification.findUniqueOrThrow({
        where: { id },
      });
    if (notification.userId !== userId) {
      throw new ForbiddenException('...');
    }
    return await this.prisma.client.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async remove(id: number, userId: number) {
    const notification =
      await this.prisma.client.notification.findUniqueOrThrow({
        where: { id },
      });
    if (notification.userId !== userId) {
      throw new ForbiddenException('...');
    }
    return await this.prisma.client.notification.delete({
      where: { id },
    });
  }
}
