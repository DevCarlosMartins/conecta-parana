import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListComunicadosQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'mostrar apenas comunicados ativos',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;
}
