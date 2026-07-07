import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { PaymentsService } from './payments.service';
import { CreateEventCheckoutDto } from './dto/create-event-checkout.dto';
import { CreateReservationCheckoutDto } from './dto/create-reservation-checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtPayload } from '../modules/auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('tickets/checkout')
  createEventCheckout(
    @Body() dto: CreateEventCheckoutDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req['user'] as JwtPayload;
    return this.paymentsService.createEventCheckout(
      dto.eventId,
      user.sub,
      dto.items,
    );
  }

  @Post('reservation/checkout')
  createReservationCheckout(@Body() dto: CreateReservationCheckoutDto) {
    return this.paymentsService.createReservationCheckout(dto.reservationId);
  }
}
