import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateComunicadoDto {
  @ApiProperty({ example: 'Titulo do comunicado' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Descricao do comunicado' })
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({
    example: true,
    description: 'indica se o comunicado esta ativo',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
