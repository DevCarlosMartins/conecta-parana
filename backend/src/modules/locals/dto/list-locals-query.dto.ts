import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListLocalsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por cidade' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Cidade deve ser um número inteiro' })
  @Min(1, { message: 'Cidade deve ser maior que zero' })
  cityId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filtrar por categoria' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Categoria deve ser um número inteiro' })
  @Min(1, { message: 'Categoria deve ser maior que zero' })
  categoryId?: number;
}
