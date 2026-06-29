import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateNotificationsDto {
  @ApiProperty({ example: 'Novo evento disponível' })
  @IsString({ message: 'Título deve ser um texto' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  title!: string;

  @ApiProperty({ example: 'Confira os detalhes do novo evento publicado.' })
  @IsString({ message: 'Descrição deve ser um texto' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  description!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do evento relacionado à notificação',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Evento deve ser um número inteiro' })
  @Min(1, { message: 'Evento deve ser maior que zero' })
  eventId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do comunicado relacionado à notificação',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Comunicado deve ser um número inteiro' })
  @Min(1, { message: 'Comunicado deve ser maior que zero' })
  comunicadoId?: number;
}
