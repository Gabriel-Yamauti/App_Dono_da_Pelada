# Mapa das telas — protótipo Figma × código implementado

> Descrição literal de cada tela do protótipo, cruzada com os arquivos que a implementam.
> Paleta e tipografia: ver `README.md` (tokens reais em `src/theme/`).

---

## 0. Estrutura global (shell de navegação)

- **Layout raiz:** `app/_layout.tsx` envolve o app no `ThemeProvider` (tema verde-escuro
  dedicado — CH-05) e no `SafeAreaProvider`.
- **Tabs inferiores persistentes:** `app/(tabs)/_layout.tsx` — barra fixa em **todas** as
  telas (CH-04), fundo `greenSurfaceAlt`, ícone outline + rótulo; aba ativa em `lime`.
  Ordem: **Jogos** (`index`) · **Coletivo** · **Reservas** · **Perfil**.
- **Cada aba:** `ScrollView` sobre `greenBackground`, com título em `weight 800` `size xxl`
  e um subtítulo em `textSecondary`. `padding 16`, respeitando `safe-area` (topo/rodapé).

---

## 1. Aba JOGOS — `app/(tabs)/index.tsx`

**Função (CLAUDE.md §1):** Hoster de partidas, partidas futuras/anteriores e **súmula digital**.

**Layout (de cima para baixo):**
1. Título **"Jogos"** + subtítulo "Suas peladas — hoster, futuras e anteriores".
2. **Lista de cartões de partida** (`src/components/jogos/PartidaCard.tsx`), um por jogo:
   - Faixa de **status** com cor semântica: `hoster` (você organiza), `confirmada`,
     `aberta` ("completar o time") e `encerrada`.
   - Título da partida, **local**, **quando** (ex.: "Hoje · 20h") e **vagas** (ex.: 8/12).
   - Partidas `encerrada` mostram **placar** (ex.: "6 x 4") e botão **"Ver súmula"**.
3. **Modal de Súmula Digital** (`src/components/jogos/SumulaDigitalModal.tsx`):
   - Abre sobre `overlay rgba(0,0,0,0.6)`; **cabeçalho fixo com botão "X" sempre visível**
     e fechamento por toque fora (CH-03 — modal contido na viewport).
   - Tabela "gamificada" por jogador: **gols, assistências, conduta** (fair-play / amarelo /
     vermelho) e marca de **craque do jogo**.

**Dados:** mock sem PII (apenas nomes de exibição — CH-15). 4 partidas de exemplo cobrindo os
4 status; súmula preenchida para a partida encerrada.

---

## 2. Aba COLETIVO — `app/(tabs)/coletivo.tsx`

**Função:** Comunidade, Torneios e **Ranking** da várzea.

**Layout:**
1. Título **"Coletivo"** + subtítulo "Comunidade, torneios e ranking da várzea".
2. Seção **"Ranking Local"** (`SectionTitle` com ícone `trophy-outline`) →
   `RankingList` (`src/components/coletivo/`): posições, nome, pontos.
3. Seção **"Posts da Comunidade"** (ícone `people-outline`) com **aviso obrigatório**
   (Modo_Operante §6.1): caixa contornada em `lime` — *"Pré-visualização · funcionalidade em
   desenvolvimento…"*. Abaixo, `PostCard`s mockados (rede social tipo Twitter) como **mockup
   estático**, já que a Comunidade é a feature de alta complexidade.

**Por que mockup:** a Comunidade foi marcada como feature de complexidade excessiva; entregue
como simulação com aviso visível, mantendo o resto do app plenamente funcional.

---

## 3. Aba RESERVAS — `app/(tabs)/reservas.tsx`

**Função:** marketplace de campos (preço, horário, local, comodidades).

**Layout:**
1. Título **"Reservas"** + subtítulo "Encontre e reserve o campo da próxima pelada".
2. **Chips de filtro** (`src/components/reservas/FilterChips.tsx`): pílulas (`radius pill`)
   selecionáveis; ativa em `lime` com texto `textOnLime`.
3. Contador "N campos disponíveis perto de você".
4. **Cartões de campo** (`FieldCard.tsx`): foto (placeholder local), nome, nota/avaliação,
   **preço por hora**, faixas de **horário** e **comodidades** (vestiário, estacionamento,
   churrasqueira…), com CTA de reserva em `lime`.

**Dados:** `src/components/reservas/data.ts` — campos fixos (degradação graciosa).

---

## 4. Aba PERFIL — `app/(tabs)/perfil.tsx`

**Função:** métricas, assiduidade, **selo de confiança**, conquistas.

**Layout:**
1. Título **"Perfil"** + subtítulo "Métricas, assiduidade e conquistas".
2. **Selo de Confiança** (`src/components/perfil/SeloConfianca.tsx`): nível (ex.: "exemplar"),
   **% de assiduidade** e **faltas** (combate ao No-Show, ancorado no CPF — CH-09; o CPF NÃO
   é exibido, só o nome — CH-15).
3. Seção **"Estatísticas"** em **grade 2 colunas** (mobile-first, CH-12):
   `EstatisticaCard.tsx` com ícone outline, valor grande, rótulo e tendência
   (gols, assistências, jogos disputados, conquistas). Cartão de destaque com borda `lime`.

**Dados:** mock sem PII.

---

## Conferência de fidelidade (checklist rápido)

- [x] Fundo verde-escuro + destaques verde-limão em todas as abas.
- [x] Títulos condensados/bold; ícones outline; cards escuros.
- [x] Tabs inferiores persistentes (CH-04).
- [x] Modal de súmula contido na viewport com "X" fixo (CH-03).
- [x] Tema escuro dedicado, sem "auto dark" desarmônico (CH-05).
- [x] Comunidade como mockup com aviso "em desenvolvimento" (Modo_Operante §6.1).
- [x] Nenhum CPF/PII exibido nas telas (CH-15).
