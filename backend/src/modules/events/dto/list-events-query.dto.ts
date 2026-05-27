import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

const toNumber = ({ value }: { value: unknown }) =>
  value === undefined || value === null || value === ''
    ? undefined
    : Number(value);

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ListEventsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra eventos por cidade',
  })
  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: 'Cidade deve ser um número inteiro' })
  @Min(1, { message: 'Cidade deve ser maior que zero' })
  cityId?: number;

  @ApiPropertyOptional({
    example: 'cultural',
    description: 'Filtra eventos por tipo',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'Tipo deve ser um texto' })
  type?: string;

  @ApiPropertyOptional({
    example: 'ativo',
    description: 'Filtra eventos por status',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'Status deve ser um texto' })
  status?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra eventos por local',
  })
  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: 'Local deve ser um número inteiro' })
  @Min(1, { message: 'Local deve ser maior que zero' })
  localId?: number;
}
