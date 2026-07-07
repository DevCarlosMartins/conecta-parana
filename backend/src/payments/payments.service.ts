import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { AbacatePayService } from './abacate-pay/abacate-pay.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly abacatePayService: AbacatePayService,
  ) {}

  async createTicketCheckout(ticketId: string) {
    const ticket = await this.prisma.client.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    if (ticket.status !== 'PENDING') {
      throw new BadRequestException('Ticket não está pendente para pagamento');
    }

    const charge = await this.abacatePayService.createPixCharge({
      amount: Math.round(Number(ticket.price) * 100),
      expiresIn: 3600,
      description: `Ingresso ${ticket.type}`,
      metadata: { externalId: ticket.id },
    });

    await this.prisma.client.ticket.update({
      where: { id: ticketId },
      data: { pixCharId: charge.data.id },
    });

    return {
      paymentId: charge.data.id,
      brCode: charge.data.brCode,
      brCodeBase64: charge.data.brCodeBase64,
      expiresAt: charge.data.expiresAt,
    };
  }

  async createReservationCheckout(reservationId: string) {
    const reservation = await this.prisma.client.tableReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (reservation.status !== 'PENDING') {
      throw new BadRequestException('Reserva não está pendente para pagamento');
    }

    if (!reservation.price) {
      throw new BadRequestException('Reserva sem valor definido');
    }

    const charge = await this.abacatePayService.createPixCharge({
      amount: Math.round(Number(reservation.price) * 100),
      expiresIn: 3600,
      description: `Reserva de mesa - ${reservation.responsibleName}`,
      metadata: { externalId: reservation.id },
    });

    await this.prisma.client.tableReservation.update({
      where: { id: reservation.id },
      data: { pixCharId: charge.data.id },
    });

    return {
      paymentId: charge.data.id,
      brCode: charge.data.brCode,
      brCodeBase64: charge.data.brCodeBase64,
      expiresAt: charge.data.expiresAt,
    };
  }

  async createEventCheckout(
    eventId: number,
    userId: number,
    items: {
      type: 'PISTA' | 'CAMAROTE';
      quantity: number;
      unitPrice: number;
    }[],
  ) {
    const event = await this.prisma.client.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const tickets = await this.prisma.client.$transaction(
      items.flatMap((item) =>
        Array.from({ length: item.quantity }).map(() =>
          this.prisma.client.ticket.create({
            data: {
              eventId,
              userId,
              type: item.type,
              price: item.unitPrice,
              status: 'PENDING',
              qrCode: randomUUID(),
            },
          }),
        ),
      ),
    );
    const charge = await this.abacatePayService.createPixCharge({
      amount: Math.round(totalAmount * 100),
      expiresIn: 3600,
      description: `Compra de ingressos para o evento ${eventId}`,
      metadata: { externalId: eventId.toString() },
    });

    const ticketIds = tickets.map((t) => t.id);
    await this.prisma.client.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: { pixCharId: charge.data.id },
    });

    return {
      paymentId: charge.data.id,
      brCode: charge.data.brCode,
      brCodeBase64: charge.data.brCodeBase64,
      expiresAt: charge.data.expiresAt,
      ticketIds,
    };
  }
}
