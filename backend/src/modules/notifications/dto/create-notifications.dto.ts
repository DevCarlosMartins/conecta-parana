import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNotificationsDto {
  @ApiProperty({ example: 'asd' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'descri' })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  eventId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  comunicadoId?: number;
}
