import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class ListNewsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por cidade' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Mostrar apenas notícias ativas',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'evento', description: 'Tipo da notícia' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'interno', description: 'Tipo do link' })
  @IsOptional()
  @IsString()
  linkType?: string;
}
