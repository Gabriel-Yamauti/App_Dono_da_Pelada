# Módulo: Navegação (expo-router + tabs)

> Tarefa **T1.3** — navegação base com as 4 abas (CLAUDE.md §1).

## Responsabilidade

Estrutura de navegação raiz do app via **expo-router** (roteamento por
arquivos). Tabs inferiores persistentes: **Jogos · Coletivo · Reservas · Perfil**,
com cabeçalho e barra de abas **persistentes em todas as telas** (CH-04) e
tematizados pela paleta verde-escuro/limão.

## Arquivos

| Caminho | Papel |
|---|---|
| `app/_layout.tsx` | Layout raiz: `SafeAreaProvider` + `ThemeProvider` + `StatusBar` + `Stack` → grupo `(tabs)`. |
| `app/(tabs)/_layout.tsx` | Navegador `Tabs` tematizado, data-driven a partir de `TABS`. |
| `app/(tabs)/index.tsx` | Aba **Jogos** (rota inicial). |
| `app/(tabs)/coletivo.tsx` | Aba **Coletivo**. |
| `app/(tabs)/reservas.tsx` | Aba **Reservas**. |
| `app/(tabs)/perfil.tsx` | Aba **Perfil**. |
| `src/lib/tabs.ts` | `TABS`: configuração declarativa (rota, label, ícone outline). |
| `src/lib/mocks.ts` | Dados mock hardcoded por aba (degradação graciosa; sem PII — CH-15). |
| `src/components/ScreenScaffold.tsx` | Esqueleto de tela reutilizável (título/subtítulo/cards) tematizado. |

## Configuração da plataforma

- `package.json`: `main = "expo-router/entry"` (substitui `App.tsx`/`index.ts`).
- `app.json`: `scheme = "donodapelada"`, plugin `expo-router`, `web.bundler = "metro"`,
  `userInterfaceStyle = "dark"`.
- `babel.config.js`: `babel-preset-expo` (habilita o expo-router no SDK 50+).

## Degradação graciosa

Cada tela é apenas `<ScreenScaffold tabKey="..." />`. O scaffold lê de
`getTabMock()`, que devolve um **mock vazio seguro** para chaves inexistentes, e
usa `useTheme()` (com fallback de tema). Assim a navegação renderiza conteúdo
estático e estável mesmo antes das features reais (T1.5–T1.8) existirem.

## Ícones

Outline via `@expo/vector-icons` (Ionicons): `football-outline`, `people-outline`,
`calendar-outline`, `person-outline` — coerente com CLAUDE.md §2.

## Testes

`tests/nav.test.ts` — valida as 4 abas na ordem certa, `index` como rota inicial
(Jogos), ícones sempre outline, presença de mock por aba, mock vazio seguro e
ausência de padrão de CPF nos mocks (CH-15).

> **Nota sobre teste de componente:** o teste de render via
> `@testing-library/react-native` v14 exige o peer `test-renderer`, cuja
> instalação foi bloqueada pelo guard de segurança do ambiente (parece typosquat).
> Optou-se por cobrir a navegação por testes de lógica (config + degradação) em vez
> de instalar um pacote não aprovado. Reavaliar quando o peer for liberado.
