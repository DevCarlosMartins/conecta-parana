import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoordinatesDto } from './coordinates.dto';

export class CreateLocalDto {
  @ApiProperty({
    example: 'Catedral Basílica Menor',
    description: 'Nome do local',
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: 'Nome deve ser um texto' })
  @Length(2, 200, { message: 'Nome deve ter entre 2 e 200 caracteres' })
  name!: string;

  @ApiProperty({
    example: 'Principal igreja de Maringá, com 124 m de altura.',
    description: 'Descrição do local',
  })
  @IsString({ message: 'Descrição deve ser um texto' })
  @MinLength(5, { message: 'Descrição deve ter pelo menos 5 caracteres' })
  description!: string;

  @ApiProperty({
    example: 'Praça da Catedral, s/n - Centro',
    description: 'Endereço do local',
  })
  @IsString({ message: 'Endereço deve ser um texto' })
  @MinLength(5, { message: 'Endereço deve ter pelo menos 5 caracteres' })
  address!: string;

  @ApiProperty({
    example: '(44) 3226-1166',
    description: 'Telefone de contato do local',
  })
  @IsString({ message: 'Telefone deve ser um texto' })
  phone!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId?: number;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
