# Fundação do Aplicativo

## Tecnologias Escolhidas
1. **Framework:** Expo + React Native
2. **Linguagem:** TypeScript
3. **Banco de Dados Local:** SQLite via expo-sqlite
4. **ORM:** Drizzle ORM
5. **Testes:** Jest + Testing Library React Native
6. **Linting:** ESLint

## Estrutura de Diretórios
- src/screens/: Telas principais do aplicativo.
- src/components/: Componentes reutilizáveis (botões, inputs, modais).
- src/auth/: Lógica de autenticação e gerenciamento de sessão.
- src/db/: Configuração do banco SQLite e schemas do Drizzle ORM.
- src/api/: Serviços e integrações externas (caso existam no futuro).
- src/lib/: Utilitários gerais e helpers.
- src/theme/: Configurações de cores, fontes e estilo global.
- 	ests/: Testes automatizados.
- docs/modulos/: Documentação de arquitetura e decisões de módulos.

## Decisões Arquiteturais
- Optou-se por usar o Expo pela facilidade de deploy e acesso rápido a APIs nativas (como o expo-sqlite).
- O SQLite local servirá para persistência rápida de dados como autenticação offline ou cache de agendamentos.
- Drizzle ORM foi escolhido pela tipagem forte em TypeScript e consultas limpas.
- Jest e ESLint garantem os "portões de qualidade por commit" estipulados no AGENTS.md.
