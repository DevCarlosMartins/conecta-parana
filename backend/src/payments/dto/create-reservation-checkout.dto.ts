import { IsUUID } from 'class-validator';

export class CreateReservationCheckoutDto {
  @IsUUID()
  reservationId!: string;
}
