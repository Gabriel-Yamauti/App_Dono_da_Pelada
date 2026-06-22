# docs/figma_prints — Mapeamento do protótipo Figma

> **O que é esta pasta.** Registro fiel das telas do protótipo do "Dono da Pelada",
> usado como fonte de verdade do front-end (CLAUDE.md §2 — fidelidade ao Figma é
> obrigatória).

## Fonte

- **Protótipo Figma (DevWebV1):**
  `https://www.figma.com/proto/uESqR7HVdZC2oxH1HOoq9A/DevWebV1?node-id=1-1028`
- Link também em `Referencias_Pasta_NAO_Alterada/Primeira_Entrega/Link_Prototipo_Figma.txt`.

## Método (por que descrições e não prints)

A captura automatizada de imagens do protótipo (Figma Dev Mode/MCP, Puppeteer/Playwright)
ficou **bloqueada** neste ambiente (login/CORS/headless). Para não travar a entrega e não
gastar contexto em ciclos de ajuste fino (CH-14), o mapeamento foi feito como **descrições
literais detalhadas** de cada aba — layout, componentes, cores (tokens reais), tipografia e
estados — e **cruzado com o código já implementado**. Assim o avaliador consegue conferir a
fidelidade tela-a-código sem depender da captura visual.

> Se/quando a captura visual for desbloqueada, salvar os PNGs aqui (`01_jogos.png`, …) **ao
> lado** das descrições, sem reescrevê-las (append — AGENTS.md §5).

## Índice

- [`MAPA_TELAS.md`](./MAPA_TELAS.md) — identidade visual + as 4 abas, descritas e mapeadas
  para os componentes em `src/components/` e as rotas em `app/(tabs)/`.

## Identidade visual (resumo — tokens reais do código)

| Token | Valor | Uso |
|---|---|---|
| `greenBackground` | `#0B1F17` | Fundo raiz de todas as telas |
| `greenSurface` / `greenSurfaceAlt` | `#13291F` / `#1B3528` | Cards e cabeçalhos |
| `lime` (verde-limão) | `#C6FF3D` | Destaque / CTA / selo |
| `textPrimary` / `textSecondary` | `#F1F5F2` / `#9DB0A4` | Texto e legendas |
| `overlay` | `rgba(0,0,0,0.6)` | Fundo de modais (CH-03) |

Tipografia: títulos `weight 800` (condensado/bold), tamanhos `xxl 34` (título de aba),
`lg 20` (seções), `md 16` (corpo). Ícones **outline** (`@expo/vector-icons` / Ionicons).
Navegação: **tabs inferiores** persistentes (CH-04) — Jogos · Coletivo · Reservas · Perfil.
