import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class CheckoutItemDto {
  @IsIn(['PISTA', 'CAMAROTE'])
  type!: 'PISTA' | 'CAMAROTE';

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}

export class CreateEventCheckoutDto {
  @IsInt()
  eventId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
