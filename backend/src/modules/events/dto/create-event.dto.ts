import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const toNumber = ({ value }: { value: unknown }) =>
  value === undefined || value === null || value === ''
    ? undefined
    : Number(value);

export class EventCoordinatesDto {
  @ApiProperty({
    example: -23.4205,
    description: 'Latitude do evento',
  })
  @IsNumber({}, { message: 'Latitude deve ser um número' })
  @Min(-90, { message: 'Latitude mínima é -90' })
  @Max(90, { message: 'Latitude máxima é 90' })
  lat!: number;

  @ApiProperty({
    example: -51.9333,
    description: 'Longitude do evento',
  })
  @IsNumber({}, { message: 'Longitude deve ser um número' })
  @Min(-180, { message: 'Longitude mínima é -180' })
  @Max(180, { message: 'Longitude máxima é 180' })
  lng!: number;
}

export class CreateEventDto {
  @ApiProperty({
    example: 'Feira Cultural de Maringá',
    description: 'Título do evento',
  })
  @Transform(trimString)
  @IsString({ message: 'Título deve ser um texto' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(150, { message: 'Título deve ter no máximo 150 caracteres' })
  title!: string;

  @ApiProperty({
    example: 'Evento aberto ao público com apresentações culturais.',
    description: 'Descrição do evento',
  })
  @Transform(trimString)
  @IsString({ message: 'Descrição deve ser um texto' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  description!: string;

  @ApiProperty({
    example: 'cultural',
    description: 'Tipo do evento',
  })
  @Transform(trimString)
  @IsString({ message: 'Tipo deve ser um texto' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type!: string;

  @ApiProperty({
    example: 'ativo',
    description: 'Status do evento',
  })
  @Transform(trimString)
  @IsString({ message: 'Status deve ser um texto' })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status!: string;

  @ApiProperty({
    example: '2026-06-17T19:00:00.000Z',
    description: 'Data e horário do evento em formato ISO',
  })
  @IsDateString({}, { message: 'Data do evento inválida' })
  eventDate!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do local vinculado ao evento, caso exista',
  })
  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: 'Local deve ser um número inteiro' })
  @Min(1, { message: 'Local deve ser maior que zero' })
  localId?: number;

  @ApiPropertyOptional({
    description: 'Coordenadas geográficas do evento',
    type: EventCoordinatesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EventCoordinatesDto)
  coordinates?: EventCoordinatesDto;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID da cidade (obrigatório apenas para super admin sem cidade associada)',
  })
  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: 'Cidade deve ser um número inteiro' })
  @Min(1, { message: 'Cidade deve ser maior que zero' })
  cityId?: number;
}
