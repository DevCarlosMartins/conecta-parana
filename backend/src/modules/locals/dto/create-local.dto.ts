import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoordinatesDto } from './coordinates.dto';

export class CreateLocalDto {
  @ApiProperty({
    example: 'Catedral Basílica Menor',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({
    example: 'Principal igreja de Maringá, com 124 m de altura.',
  })
  @IsString()
  @MinLength(5)
  description!: string;

  @ApiProperty({ example: 'Praça da Catedral, s/n - Centro' })
  @IsString()
  @MinLength(5)
  address!: string;

  @ApiProperty({ example: '(44) 3226-1166' })
  @IsString()
  phone!: string;

  @ApiProperty({
    example: 1,
    description: 'ID de uma categoria existente (ver GET /categories)',
  })
  @IsInt()
  categoryId!: number;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
