import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'Título da notícia' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Descrição da notícia' })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ example: 'evento', description: 'Tipo da notícia' })
  @IsString()
  @MinLength(3)
  type!: string;

  @ApiProperty({
    example: 'interno',
    description: 'Tipo do link associado à notícia',
  })
  @IsString()
  @MinLength(3)
  linkType!: string;

  @ApiProperty({ example: true, description: 'Indica se a notícia está ativa' })
  @IsBoolean()
  @IsOptional()
  isActive!: boolean;
}
