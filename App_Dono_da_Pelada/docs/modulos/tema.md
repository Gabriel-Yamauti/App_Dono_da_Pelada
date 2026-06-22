# Módulo: Tema / Identidade Visual

> Tarefa **T1.2** — tokens de cor verde-escuro/limão e sistema de tema.

## Responsabilidade

Fonte única de verdade da identidade visual do app (CLAUDE.md §2): paleta
**verde-escuro** (fundo) + **verde-limão** (destaque/CTA), tipografia, espaçamento
e raios. Todo componente consome cores **só** por aqui — nada de cor hardcoded
nas telas (evita o "dark mode feio" do CH-05 e quebras de responsividade CH-12).

## Arquivos

| Caminho | Papel |
|---|---|
| `src/theme/colors.ts` | Paleta (`palette`): verdes-escuros de fundo/superfície, verde-limão, texto, estados semânticos. |
| `src/theme/tokens.ts` | `typography` (tamanhos/pesos; títulos bold), `spacing`, `radius`. |
| `src/theme/index.tsx` | Objeto `theme`, `ThemeProvider` e hook `useTheme()`. |

## Tokens principais

- **Fundo:** `greenBackground #0B1F17` · **Superfícies:** `greenSurface`, `greenSurfaceAlt`, `greenBorder`.
- **Destaque/CTA:** `lime #C6FF3D` (+ `limePressed`, `limeMuted`).
- **Texto:** `textPrimary`, `textSecondary`, `textOnLime` (texto escuro sobre botão limão = contraste alto).
- **Semânticos:** `success`, `warning`, `danger`; utilitários `overlay` (modais — CH-03).

## Degradação graciosa

`createContext(theme)` é inicializado com o tema padrão; portanto `useTheme()`
**nunca lança**: se algum componente for montado fora do `ThemeProvider`, ele
ainda recebe a paleta completa em vez de quebrar. É um requisito explícito da tarefa
e a base do esqueleto de tela (`ScreenScaffold`).

## Como usar

```tsx
import { useTheme } from '../src/theme';

function Botao() {
  const t = useTheme();
  return <View style={{ backgroundColor: t.colors.lime, borderRadius: t.radius.pill }} />;
}
```

## Testes

`tests/theme.test.ts` — valida fundo/destaque, paleta completa do tema escuro
(CH-05), contraste do texto sobre o limão e presença dos tokens de tipografia/
espaçamento/raio.

## Decisões / pendências

- `typography.family` fica `undefined` (fonte do sistema) até embarcar uma fonte
  condensada — degradação graciosa, sem travar a entrega.
- Tema **único** (escuro) por ora; `ThemeProvider` aceita `value` para um futuro
  tema alternativo sem refatorar consumidores.
