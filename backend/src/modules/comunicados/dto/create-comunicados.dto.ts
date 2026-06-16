import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateComunicadosDto {
  @ApiProperty({ example: 'Título do comunicados' })
  @IsString({ message: 'Título deve ser um texto' })
  @MinLength(3, { message: 'Título deve haver pelo menos 3 caracteres' })
  title!: string;

  @ApiProperty({ example: 'Descrição do comunicados' })
  @IsString({ message: 'Descrição do campo é obrigatoria' })
  @MinLength(10, { message: 'A descrição deve haver no minimo 10 caracteres' })
  description!: string;

  @ApiProperty({
    example: true,
    description: 'indica se o comunicados está ativo',
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  @IsOptional()
  isActive?: boolean;
}
