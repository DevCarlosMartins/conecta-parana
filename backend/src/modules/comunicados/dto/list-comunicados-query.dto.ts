import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListComunicadosQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'mostrar apenas comunicados ativos',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isActive deve ser um booleano' })
  isActive?: boolean;
}
