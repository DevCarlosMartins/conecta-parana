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
  @ApiProperty({ example: 'Catedral Basílica Menor' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: 'Principal igreja de Maringá.' })
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