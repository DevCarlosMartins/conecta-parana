import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListNewsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por cidade' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Cidade deve ser um número inteiro' })
  @Min(1, { message: 'Cidade deve ser maior que zero' })
  cityId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Mostrar apenas notícias ativas',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'evento', description: 'Tipo da notícia' })
  @IsOptional()
  @IsString({ message: 'Tipo deve ser um texto' })
  type?: string;

  @ApiPropertyOptional({ example: 'interno', description: 'Tipo do link' })
  @IsOptional()
  @IsString({ message: 'Tipo do link deve ser um texto' })
  linkType?: string;
}
