import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CoordinatesDto {
  @ApiProperty({ example: -23.4205, description: 'Latitude (-90 a 90)' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: -51.9331, description: 'Longitude (-180 a 180)' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}
