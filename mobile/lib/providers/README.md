# Providers

Essa pasta guarda os providers globais do app mobile.

Os providers são responsáveis por controlar estados compartilhados entre telas, como autenticação, loading, dados do usuário logado e outras informações globais.

## Convenção

- Cada provider deve extender `ChangeNotifier`.
- O nome do arquivo deve seguir `snake_case`.
- O nome da classe deve terminar com `Provider`.
- Estados internos devem ser privados usando `_`.
- A tela deve acessar os dados por getters públicos.

Exemplo:

- `auth_provider.dart` controla login, cadastro, logout, loading e mensagens de erro/sucesso.