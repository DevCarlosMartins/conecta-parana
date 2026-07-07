import { IsUUID } from 'class-validator';

export class CreateTicketCheckoutDto {
  @IsUUID()
  ticketId!: string;
}
