# Módulo — Redesign de Front (fidelidade ao Figma) · integração da branch `04-Reajustes-FRONT`

> **Origem:** trabalho do colaborador (Pedro) feito na branch `04-Reajustes-FRONT` (commits
> `5d62182 primeira implementação (pedro)` e `8eec489 front parecido`), integrado à `02-Main-Develop`
> em 2026-06-22 **sem** trazer a organização de método antiga (fluxo Apenas Claude preservado).
> As duas branches divergiram no commit inicial do método (`e08258e`), por isso a integração foi
> feita por **checkout path-scoped** apenas dos arquivos de front/funcionalidade do app, e **não** por
> merge das pastas de método.

## O que este redesign muda (resumo)

O colaborador aproximou o app do protótipo do Figma ("front parecido"). Mudanças por área:

### 1. Tema / Identidade visual (`src/theme/`)
- **Paleta repaginada (`colors.ts`)** para o tom do Figma:
  - Fundo `greenBackground` `#0B1F17` → **`#131313`**; superfícies `#1c1b1b` / `#2a2a2a`; borda `#2e2e2e`.
  - Verde-limão `lime` `#C6FF3D` → **`#c3f400`** (pressed `#aed800`, muted `#7ba100`).
  - CTA verde escuro: `greenCta` `#00452e`, `greenCtaPressed` `#003322`, `greenCtaDeep` `#002216`,
    `textOnGreen` `#76b394`.
  - Texto primário `#e5e2e1`, secundário `#c1c8c2`.
- **Tipografia (`tokens.ts`)** agora aponta para fontes reais: `title: 'Space Grotesk'`,
  `body: 'Manrope'`, `lexend: 'Lexend'` (antes `undefined` → fonte do sistema).

### 2. Fontes (Google Fonts via `expo-font`)
- Novas dependências: `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/manrope`,
  `@expo-google-fonts/lexend`, `expo-font`. Plugin `expo-font` adicionado em `app.json`.
- **`app/_layout.tsx`** carrega as fontes com `useFonts(...)` e exibe um **gate de carregamento**
  (`ActivityIndicator` lima sobre fundo `#131313`) até as fontes estarem prontas. Mapeia aliases
  `'Space Grotesk'`, `'Lexend'`, `'Manrope'` usados nos `fontFamily` das telas.

### 3. Navegação / Cabeçalho (`app/(tabs)/_layout.tsx`)
- **`headerShown: false`** — o header nativo das tabs foi desligado; cada tela renderiza seu **próprio
  cabeçalho persistente** (logo "Dono da Pelada" + ícone de sino com ponto de notificação). Mantém o
  princípio de cabeçalho persistente (CH-04), agora custom e fiel ao Figma.

### 4. Telas (`app/(tabs)/`)
- **Jogos (`index.tsx`)**: título de página "MEUS JOGOS" + subtítulo "Controle total da sua agenda de
  campo"; `fontFamily` aplicado a logo/títulos/labels/botões; input do modal usa fundo `#131313`.
- **Perfil (`perfil.tsx`)**: cabeçalho custom + cabeçalho de página "Conta / Gerencie as informações e
  dados da sua conta."; estrutura passou de `ScrollView` raiz para `View` + header fixo + `ScrollView`.
- **Reservas (`reservas.tsx`)**: cabeçalho custom + título "RESERVAR ARENA / Encontre o palco perfeito…";
  chips de filtro restilizados (estado ativo translúcido `rgba(0,69,46,0.3)` com borda `#95d4b9`);
  rótulo de preço "R$ X/hora" → **"R$ X/100 min"** (texto fiel ao Figma).
- **Coletivo (`coletivo.tsx`)**: maior reformulação visual (feed/torneios/rankings) para o layout do Figma.

### 5. Reservas — `FieldCard.tsx`
- Foto do campo agora usa **imagem real** (`ImageBackground`) mapeada por `campo.id`
  (`FIELD_IMAGES`), com overlay escuro `rgba(0,0,0,0.35)` para contraste; fallback para `v1_414.png`.
- Mesmo ajuste de texto de preço "/hora" → "/100 min" no `Alert` de confirmação.

### 6. Assets (`assets/images/`)
- **19 imagens exportadas do Figma** (`v1_*.png`, `v2_47.png`) adicionadas — usadas como fotos de arena
  e elementos visuais.

## Arquivos tocados na integração
`app/(tabs)/{coletivo,index,perfil,reservas,_layout}.tsx`, `app/_layout.tsx`,
`src/components/reservas/FieldCard.tsx`, `src/theme/{colors,tokens}.ts`, `tests/theme.test.ts`
(ajustado às novas cores), `app.json`, `package.json`, `package-lock.json`, `assets/images/*`.

**Deliberadamente NÃO trazidos:** `App_Dono_da_Pelada/CLAUDE.md` e `AGENTS.md` do colaborador (eram do
método antigo Antigravity) — mantidas as versões do fluxo **Apenas Claude** já presentes na `02`.

## Estado dos gates após a integração (2026-06-22)
- `npm ci` (lockfile do colaborador, com as fontes) ✓
- `npm run lint` → 0 erros (4 *warnings* de variáveis não usadas em `coletivo.tsx`, herdadas do rework)
- `npm run typecheck` → 0 erros
- `npm test` → **25/25 / 4 suítes** ✓

## Pendências / limpeza sugerida (para os ajustes finais)
- Remover do `coletivo.tsx` os imports/variáveis não usados (`RankingList`, `SectionTitle`,
  `setTorneioFilter`, `filteredTorneios`) — eliminam os 4 *warnings* do lint.
- Verificação visual do Coletivo lado a lado com o Figma (foi a maior reformulação).
