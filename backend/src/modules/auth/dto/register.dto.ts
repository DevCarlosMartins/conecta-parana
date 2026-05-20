import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'Johnny CuteBottom' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório!' })
  name!: string;

  @ApiProperty({ example: 'johnny.cutebottom@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsNotEmpty({ message: 'Email é obrigatório!' })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória!' })
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  cityId!: number;
}
