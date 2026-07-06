import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAdmins() {
    return this.prisma.client.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        name: true,
        email: true,
        cityId: true,
        role: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    return this.prisma.client.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.password && { password: dto.password }),
        ...(dto.cityId && { cityId: Number(dto.cityId) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        cityId: true,
        role: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    return this.prisma.client.user.delete({ where: { id } });
  }
}
