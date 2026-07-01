import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({
    example: 'Prefeitura anuncia novo programa de habitação',
    description: 'Título da notícia',
  })
  @IsString({ message: 'Título deve ser um texto' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  title!: string;

  @ApiProperty({
    example: 'A prefeitura municipal divulgou nesta terça-feira...',
    description: 'Descrição da notícia',
  })
  @IsString({ message: 'Descrição deve ser um texto' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  description!: string;

  @ApiProperty({ example: 'geral', description: 'Tipo da notícia' })
  @IsString({ message: 'Tipo deve ser um texto' })
  @MinLength(3, { message: 'Tipo deve ter pelo menos 3 caracteres' })
  type!: string;

  @ApiProperty({
    example: 'external',
    description: 'Tipo do link associado à notícia',
  })
  @IsString({ message: 'Tipo do link deve ser um texto' })
  @MinLength(3, { message: 'Tipo do link deve ter pelo menos 3 caracteres' })
  linkType!: string;

  @ApiPropertyOptional({
    example: 'https://g1.globo.com/pr/norte-noroeste/noticia/exemplo.ghtml',
    description: 'URL externa ou slug interno da notícia',
  })
  @IsOptional()
  @IsString({ message: 'URL da notícia deve ser um texto' })
  linkUrl?: string;

  @ApiProperty({ example: true, description: 'Indica se a notícia está ativa' })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  @IsOptional()
  isActive!: boolean;
}
