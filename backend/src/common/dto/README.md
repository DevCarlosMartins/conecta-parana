# Convenções para DTOs

Este documento registra o padrão de criação e manutenção de DTOs no backend do Conecta Paraná.

## DTOs de atualização

Sempre que existir um DTO de update, ele deve reutilizar o DTO de criação com `PartialType`.

Exemplo:

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateCityDto } from './create-city.dto';

export class UpdateCityDto extends PartialType(CreateCityDto) {}
```

Isso evita duplicação de código e garante que todos os campos do update sejam opcionais.

## Normalização de email

Campos de email devem ser normalizados com `@Transform`, usando lowercase e trim.

Exemplo:

```ts
import { Transform } from 'class-transformer';

@Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase().trim() : value,
)
@IsEmail({}, { message: 'Email inválido' })
email!: string;
```

Essa normalização evita que emails como `JOAO@TEST.com` e `joao@test.com` sejam tratados como usuários diferentes.

## Validação

Sempre usar `class-validator` nos DTOs.

Evite validação básica manual no service. O service deve ficar responsável por regras de negócio.

Exemplo:

```ts
@IsString({ message: 'Nome deve ser um texto' })
@IsNotEmpty({ message: 'Nome é obrigatório' })
name!: string;
```

## Mensagens de erro

As mensagens de erro dos decorators devem estar em português usando a opção `message`.

Exemplo:

```ts
@IsEmail({}, { message: 'Email inválido' })
email!: string;
```