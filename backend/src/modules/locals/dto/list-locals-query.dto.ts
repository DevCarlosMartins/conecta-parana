import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListLocalsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por cidade' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filtrar por categoria' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
