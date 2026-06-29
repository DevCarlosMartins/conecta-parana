import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateComunicadosDto {
  @ApiProperty({ example: 'Título do comunicado' })
  @IsString({ message: 'Título deve ser um texto' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  title!: string;

  @ApiProperty({ example: 'Descrição do comunicado' })
  @IsString({ message: 'Descrição deve ser um texto' })
  @MinLength(10, { message: 'A descrição deve ter no mínimo 10 caracteres' })
  description!: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o comunicado está ativo',
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  @IsOptional()
  isActive?: boolean;
}
