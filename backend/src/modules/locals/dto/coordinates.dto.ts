import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CoordinatesDto {
  @ApiProperty({ example: -23.4205, description: 'Latitude (-90 a 90)' })
  @IsNumber({}, { message: 'Latitude deve ser um número' })
  @Min(-90, { message: 'Latitude mínima é -90' })
  @Max(90, { message: 'Latitude máxima é 90' })
  lat!: number;

  @ApiProperty({ example: -51.9331, description: 'Longitude (-180 a 180)' })
  @IsNumber({}, { message: 'Longitude deve ser um número' })
  @Min(-180, { message: 'Longitude mínima é -180' })
  @Max(180, { message: 'Longitude máxima é 180' })
  lng!: number;
}
