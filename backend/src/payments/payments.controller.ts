import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateTicketCheckoutDto } from './dto/create-ticket-checkout.dto';
import { CreateReservationCheckoutDto } from './dto/create-reservation-checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('tickets/checkout')
  createTicketCheckout(@Body() dto: CreateTicketCheckoutDto) {
    return this.paymentsService.createTicketCheckout(dto.ticketId);
  }

  @Post('reservation/checkout')
  createReservationCheckout(@Body() dto: CreateReservationCheckoutDto) {
    return this.paymentsService.createReservationCheckout(dto.reservationId);
  }
}
