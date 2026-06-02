import { PartialType } from '@nestjs/swagger';
import { CreateComunicadosDto } from './create-comunicados.dto';

export class UpdateComunicadosDto extends PartialType(CreateComunicadosDto) {}
