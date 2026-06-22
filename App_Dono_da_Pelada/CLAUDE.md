---
documento: CLAUDE.md
titulo: "Constituição Viva do Projeto — Dono da Pelada (variante Apenas Claude Code)"
versao: 2.0-claude
data: 2026-06-22
papel: "Spec que evolui (onboarding doc lido a CADA sessão/subagente): visão, stack e versões, estrutura, padrões, matriz de modelos e a seção CRÍTICA 'Common Hurdles'."
quem_me_le: "CLAUDE-CODE (todo agente/subagente, no início de cada sessão) e o OPERADOR HUMANO (navegador)."
quando: "No arranque e SEMPRE no início de cada sessão/subagente. A parte estável é cacheável; o que cresce vai para o FIM (§10 Common Hurdles)."
ler_antes: ["Modo_Operante.md"]
ler_depois: ["MAP.md", "AGENTS.md", "Metodo_Modo_Operante_v2/SECURITY.md", "Metodo_Modo_Operante_v2/TESTING.md"]
estavel_ate: "§9 (PREFIXO ESTÁVEL — não editar acima desta linha para preservar o cache; adicionar Common Hurdles ao FIM, §10)"
variante: "APENAS CLAUDE CODE — sem Antigravity/Gemini. A variante original está preservada em ../Modo_Operante_Antigravity_Claude/."
---

# CLAUDE.md — Constituição Viva do Projeto "Dono da Pelada"

> **Variante Apenas Claude Code.** Neste método não há uma segunda IA: o **operador humano** é o
> **navegador** (decisões macro, portões, troca de modelo) e o **Claude Code** é o executor +
> orquestrador tático (planeja, escreve código, faz git, dispara subagentes, paraleliza com worktrees
> e múltiplos terminais). Ver `Modo_Operante.md` §1–2.

> **Leia-me a cada sessão.** Você (Claude Code) realmente lê este arquivo, então ele é o maior
> retorno de qualidade do projeto. As regras abaixo são vinculantes. As **§§1–9 são o PREFIXO ESTÁVEL**
> (não reescrever — preserva o prompt-caching de −90%). Lições novas entram **só na §10 (Common
> Hurdles)**, ao fim.

---

## 1. Visão do produto

**Dono da Pelada** — app de **gestão do futebol amador** (web + iOS + Android). Centraliza o que hoje é
fragmentado e estressante: achar/reservar campo, combater o **No-Show** (faltas), gerir presença e
comunidade, e encontrar partidas para entrar. Diferenciais: **CPF como âncora de identidade**
(histórico de comprometimento/faltas), **súmula digital** ("gamificar a várzea": gols, assistências,
conduta), **marketplace de reservas** (campos com preço/horário/local/comodidades) e **partidas
públicas** ("completar o time"). Público inclui adultos; UI clara e direta.

**Usuários:** `jogador` → (`jogador-hoster`, `jogador`); `dono de campo`. (Casos de uso completos: 1ª
entrega, `Referencias_Pasta_NAO_Alterada/Primeira_Entrega/Relatorio_Parcial_...pdf`.)

**Abas (4):** **Jogos** (Hoster / Partidas futuras / anteriores + súmula), **Coletivo** (Comunidade /
Torneios / Ranking), **Reservas** (marketplace de campos), **Perfil** (métricas, assiduidade, selo de
confiança, conquistas).

---

## 2. Identidade visual (fidelidade ao Figma é obrigatória)

- **Figma (abrir e mapear TODAS as telas):**
  `https://www.figma.com/proto/uESqR7HVdZC2oxH1HOoq9A/DevWebV1?node-id=1-1028`
- **Paleta:** **verde-escuro** (fundo) + **verde-limão** (destaque/CTA); cards escuros com foto;
  acentos claros. **Tipografia:** condensada/bold nos títulos. **Ícones:** outline. **Navegação:**
  tabs inferiores (Jogos · Coletivo · Reservas · Perfil) + menu/topo.
- **Regra:** o front sai **fiel de primeira** via handoff de design (Figma Dev Mode/MCP ou Claude
  Design — ver `Modo_Operante.md` §6 e pilar 11). Evitar ciclos longos de ajuste fino em chat
  (gastam contexto e aumentam alucinação — CH-14).

---

## 3. Stack e versões (confirmar versões exatas na Fase 0/1 e fixar lockfile)

| Camada | Tecnologia | Versão | Status |
|---|---|---|---|
| App multiplataforma | **Expo** (Expo Router; react-native-web para web; EAS/emuladores p/ demo) | a fixar | confirmar |
| Base | **React Native** | a fixar | escolhido na 1ª entrega |
| Linguagem | **TypeScript** | a fixar | — |
| ORM | **Drizzle ORM** | a fixar | recomendado (ADR-0002) |
| Banco (dev local) | **SQLite** (expo-sqlite / op-sqlite) | a fixar | local-first |
| Banco (deploy) | **Turso / libSQL** (compatível SQLite) | a fixar | só no portão (§10) |
| Back-end | API leve (route handlers / serviço Node), local no dev | a fixar | "desejável" p/ a disciplina |
| Testes | Jest + Testing Library (unit/integr.); Playwright/Maestro (E2E) | a fixar | ver TESTING.md |
| Deploy | **Vercel** (web) + **GitHub** (repo) | — | só no portão (§10) |

> **Não fixar nuvem no dev (§5 do Modo_Operante).** Versões marcadas "a fixar" devem ser confirmadas e
> travadas em lockfile no arranque, e registradas aqui e no `HANDOFF.md`.

---

## 4. Estrutura de diretórios (raiz = raiz do repositório)

```text
<raiz do repo>/                           ← repo git LOCAL
├── CLAUDE.md  AGENTS.md  (ativos na raiz, lidos pelo Claude Code)
├── Diario_de_Bordo_TCC.md
├── Modo_Operante_Apenas_Claude/      ← MÉTODO ativo (esta variante)
│   ├── MAP.md  Modo_Operante.md  CLAUDE.md  AGENTS.md  HANDOFF.md
│   ├── Metodo_Modo_Operante_v2/   (SECURITY, TESTING, INSTRUCOES_ENTREGAVEIS, tasks, ADR/, Cerebros/)
│   └── Base_de_Conhecimento_Pesquisas/  (INDICE_PESQUISAS + Pesquisas_Copia/ 61)
├── Modo_Operante_Antigravity_Claude/ ← MÉTODO original (Antigravity+Claude) preservado
├── App_Dono_da_Pelada/        ← FASE 1: código aqui (CLAUDE.md e AGENTS.md copiados p/ esta raiz)
│   ├── src/  (screens/, components/, auth/, db/, api/, lib/, theme/)
│   ├── docs/modulos/<modulo>.md   ← 1 doc por módulo (revelação progressiva)
│   └── tests/
├── Entregaveis_Finais_Projeto_Final/  (Fase 2 + Documentacao_Didatica/)
└── Referencias_Pasta_NAO_Alterada/    ← IMUTÁVEL (somente leitura)
```

> Quando o app for criado, **copiar `CLAUDE.md` e `AGENTS.md` para `App_Dono_da_Pelada/`** (raiz que o
> Claude Code lê) e manter as cópias sincronizadas. Atualizar `MAP.md` › §4 (mapa de módulos) a cada
> módulo novo.

---

## 5. Padrões de engenharia (vinculantes)

1. **TDD Red-Green-Refactor** por subagentes; razão teste/código saudável (~1.5×); nenhuma lógica em
   produção sem teste correspondente. (Ver `TESTING.md`.)
2. **Small releases / commits atômicos** (Conventional Commits); CI local a cada commit (lint →
   type-check → SAST → SCA/segredos → testes). (Ver `AGENTS.md` e `SECURITY.md`.)
3. **Refactoring contínuo:** o navegador (humano) decide "o quê extrair"; o Claude Code refatora.
   **Barrar over-engenharia** (CH-14).
4. **Documentação precede o merge:** doc de módulo + linha no `MAP.md` antes de marcar concluído.
5. **Revelação progressiva:** abrir só o módulo necessário; topo dos arquivos magnos estável.
6. **Segredos nunca no código/git/.md** (CH-08); usar variáveis de ambiente; `.gitignore` robusto.

---

## 6. Matriz de roteamento de modelos (qualidade 1º, com teto de custo)

| Tipo de tarefa | Modelo | Por quê | Risco se rebaixar |
|---|---|---|---|
| Arquitetura, decisões (ADR), bugs transversais multi-arquivo | **Opus 4.8** | Raciocínio máximo | Dívida técnica, retrabalho |
| Auditoria de segurança / zero-day / threat model | **Opus 4.8** | Detecção profunda | Vulnerabilidade aberta |
| Deploy e integração crítica | **Opus 4.8** | Perfeição exigida | Deploy quebrado (CH-06/11) |
| Implementação de features, testes de integração | **Sonnet 4.6** | Bom custo/qualidade | — |
| Boilerplate, CSS, testes mecânicos, tarefas repetitivas | **Haiku 4.5** | Barato e suficiente | (ok rebaixar aqui) |
| **NUNCA rebaixar:** back-end, segurança, deploy | **≥ Sonnet, subir p/ Opus** | Lição BeerTrip (CH-02) | Perda de qualidade na entrega |

**Como trocar de modelo (Apenas Claude Code):** o navegador usa `/model` na sessão; para subagentes,
fixar `model:` no frontmatter do agente ou no disparo do Task. **Troca dinâmica:** falha em gate /
baixa confiança / criticidade de segurança / ≥2 tentativas falhas → **subir** de modelo e verificar com
um **subagente revisor independente** (contexto limpo); tarefa trivial confirmada → **descer**.
Preços e limites: ver `Modo_Operante.md` §3 (fonte verificada). **Não usar nomes antigos** ("Opus 4.7").

---

## 7. Banco de dados e dados sensíveis

- **Recomendação (ADR-0002):** **SQLite + Drizzle ORM** local no dev (zero nuvem), portável para
  **Turso/libSQL** no deploy. Migrações **idempotentes** e versionadas.
- **CPF/PII:** o CPF é âncora de identidade; tratar como dado pessoal (LGPD): **minimizar**, **nunca**
  expor em logs/PDFs/`.md`/git, criptografar em repouso/trânsito, validar de forma tolerante a erro
  **sem permitir account takeover** (validar por CPF; nome é só exibição — CH-09).
- **CSV (import):** separador **ponto-e-vírgula `;`**; **upsert por CPF** (atualiza role
  "visitante"→"verificado"; cria se não existir); validar contagens (CH-10).

---

## 8. Definition of Done (por feature)

Feita = (1) testes passam (unit/integr./E2E relevantes); (2) gates de segurança verdes (SAST/SCA/
segredos); (3) fiel ao Figma e responsiva (web + telas pequenas/grandes + iOS/Android); (4) doc de
módulo + linha no `MAP.md`; (5) commit atômico na `02-Main-Develop`; (6) sem segredo exposto.

---

## 9. Como esta spec evolui

Quando um agente resolve um erro causado por peculiaridade da stack, **a lição vira um Common Hurdle**
(§10) — **sintoma → causa-raiz → regra preventiva** — para imunizar sessões futuras. Adicionar **ao
FIM** (preserva o cache). A atualização **precede** a autorização do merge.

---
---

## 10. COMMON HURDLES (sistema imunológico — cresce ao fim)

> Lições reais extraídas de `Referencias_Pasta_NAO_Alterada/Prompts BeerTrip_App.md` e
> `Diario_de_Bordo_TCC.md`. Formato: **sintoma → causa-raiz → regra preventiva**. Adicionar novas
> conforme o projeto avança (append-only).

### CH-01 — A sessão/orquestrador perde a memória do projeto
- **Sintoma:** no BeerTrip, o orquestrador (Antigravity) "esqueceu" todo o chat e o estado do projeto
  no meio do trabalho. O mesmo vale para **qualquer sessão/terminal/subagente do Claude Code**, que
  começa sempre com contexto limpo.
- **Causa-raiz:** continuidade ancorada na memória de chat (volátil), não em arquivos.
- **Regra:** continuidade **sempre** em `CLAUDE.md` + `HANDOFF.md` + `tasks.md` + diário. Reescrever
  `HANDOFF.md` a cada marco. Nenhuma decisão vive só no chat de um terminal.

### CH-02 — Não trocar de modelo por tarefa
- **Sintoma:** qualidade/custo saíram de controle; back-end/segurança/deploy sofreram.
- **Causa-raiz:** modelo fixo para tudo; sem matriz de roteamento nem escalonamento.
- **Regra:** aplicar a **matriz §6** (via `/model` e `model:` nos subagentes); **nunca** rebaixar
  back-end/segurança/deploy; escalar em falha; verificar com um subagente revisor independente.

### CH-03 — Pop-ups saindo da tela e botão de fechar (X) sumindo no scroll
- **Sintoma:** pop-ups vazavam da viewport; o "X" subia e desaparecia ao rolar.
- **Causa-raiz:** modais sem contenção na viewport e sem cabeçalho fixo.
- **Regra:** modais **contidos na viewport**, com **botão de fechar fixo** (sempre visível) e fechar
  por "X" **ou** toque fora. Testar em telas pequenas e grandes.

### CH-04 — Menu sanduíche desaparece entre telas
- **Sintoma:** o botão de menu (3 barras) sumia ao trocar de tela.
- **Causa-raiz:** o cabeçalho/menu não era persistente no layout de navegação.
- **Regra:** cabeçalho/menu **persistente em todas as telas** (layout raiz da navegação), posição fixa.

### CH-05 — Dark mode automático feio
- **Sintoma:** a troca automática de tema (claro/escuro do dispositivo) ficava desarmônica.
- **Causa-raiz:** ausência de paleta dedicada para o tema escuro.
- **Regra:** definir **paleta completa para tema escuro** (tokens de cor) coerente com a identidade
  verde-escura; testar a troca automática.

### CH-06 — HTTPS-First bloqueia em Mac/Android (e PDF "inseguro")
- **Sintoma:** funcionava no Windows (HTTP), mas Mac/Samsung/iPhone bloqueavam (tela preta/erro de
  rede); navegador marcava PDF baixado como "inseguro".
- **Causa-raiz:** conexão sem **HTTPS/TLS**; navegadores modernos aplicam **HTTPS-First**; PDF servido
  sem headers/certificado adequados.
- **Regra:** **HTTPS obrigatório** (certificado válido) **antes** de testar em múltiplos dispositivos;
  no portão de deploy, validar TLS e os headers de download; testar web + Android + iOS. (Ver
  `SECURITY.md` › pós-deploy.)

### CH-07 — Hierarquia de dados entendida errada
- **Sintoma:** patrocinador "Platina" tratado como nível em vez de marca (hierarquia trocada).
- **Causa-raiz:** a IA inferiu a estrutura em vez de conferir contra a fonte.
- **Regra:** **verificar dados contra a fonte** (relatório/CSV/Figma) antes de modelar; não inferir
  hierarquia; quando em dúvida, perguntar/registrar.

### CH-08 — Vazamento de credenciais para arquivo/repositório
- **Sintoma:** chaves AWS, secret keys, token (JWT), senhas de admin/webmail **expostas** em arquivo de
  prompts no BeerTrip.
- **Causa-raiz:** segredos colados em texto/`.md` e/ou enviados ao git.
- **Regra (DURA):** **nunca** gravar segredos em `.md`/código/git; usar **variáveis de ambiente**;
  `.gitignore` robusto; **secret scanning** (gitleaks/trufflehog) no CI; se um segredo aparecer,
  **rotacionar/revogar** e registrar **apenas o fato** no diário (nunca o valor). Ver `SECURITY.md`.

### CH-09 — Sessão/login: contas duplicadas por dispositivo e dados não acompanham
- **Sintoma:** cada dispositivo criava um login novo para o mesmo CPF; avaliações/foto/comentários não
  acompanhavam; contagem de avaliações não subia no painel.
- **Causa-raiz:** identidade não ancorada só no CPF; persistência de sessão inconsistente.
- **Regra:** **CPF é a chave** de identidade (nome é só exibição); sessão **persistente e segura**
  (re-login valida por CPF; anti-takeover); garantir que métricas agreguem pelo CPF.

### CH-10 — Import de CSV (separador e upsert) com contagens erradas
- **Sintoma:** CSV de N linhas gerou contagens inconsistentes (criados/ignorados ≠ esperado).
- **Causa-raiz:** parsing/escape (vírgula em descrições) e lógica de upsert mal definidos.
- **Regra:** CSV **separado por `;`**; **upsert por CPF** (atualiza/insere); validar contagem
  importada × linhas; testes para casos com pontuação e duplicatas.

### CH-11 — NXDOMAIN: IP público da instância muda ao reiniciar
- **Sintoma:** `DNS_PROBE_FINISHED_NXDOMAIN` — subdomínio caiu após a instância reiniciar.
- **Causa-raiz:** registro A apontando para IP público dinâmico (mudou no restart).
- **Regra:** usar **IP fixo/elástico** (ou DNS gerenciado/CDN estável); no deploy, garantir
  apontamento estável e documentar o procedimento de recuperação.

### CH-12 — Responsividade quebra no desktop ao corrigir o mobile (e vice-versa)
- **Sintoma:** ajustes de layout quebravam ora o desktop, ora o celular.
- **Causa-raiz:** CSS/layout sem breakpoints disciplinados; mobile é prioridade mas o web também conta.
- **Regra:** **mobile-first** com breakpoints explícitos; verificação visual (screenshots/diff) em
  telas pequenas, grandes, tablet e desktop **a cada** mudança de layout (ver `TESTING.md`).

### CH-13 — IA não é proativa em segurança (lição Akita)
- **Sintoma:** o executor implementa o pedido mas **não sugere** SSRF guard, rate limiting, encryption
  at rest, CSP, security headers.
- **Causa-raiz:** modelos implementam o explícito; não propõem proteções por conta própria.
- **Regra:** o **navegador (humano) impõe** o **checklist de segurança proativa** (`SECURITY.md`) em
  **cada fase**, por padrão — não como etapa final.

### CH-14 — Over-engenharia / empilhar código sem refatorar
- **Sintoma:** a IA acumula complexidade e código sobre código em vez de simplificar.
- **Causa-raiz:** tendência dos modelos ao over-engineering; ninguém manda refatorar.
- **Regra:** o navegador (humano) **interrompe, simplifica e prioriza**; refactoring contínuo
  com a rede de testes como proteção; barrar abstrações não justificadas.

### CH-15 — PII/segredo em artefatos gerados (PDF)
- **Sintoma:** PDF de histórico saía com **CPF** do usuário; design pobre.
- **Causa-raiz:** geração de artefato sem política de dados (o que pode/não pode aparecer).
- **Regra:** artefatos gerados (PDF/relatórios) **só com dados permitidos** (nome sim, **CPF não**);
  rate-limit de geração para evitar abuso; gerar de forma segura (headers/certificado — CH-06).

> **Como adicionar:** novo obstáculo → `### CH-NN — <título>` com sintoma/causa/regra, **ao fim**,
> e registrar a adição no `Diario_de_Bordo_TCC.md`.

### CH-16 — SharedArrayBuffer is not defined no Expo Web
- **Sintoma:** O app crasha com `ReferenceError: SharedArrayBuffer is not defined` ao rodar no navegador.
- **Causa-raiz:** O `expo-sqlite` no Web usa WASM e tenta carregar/verificar `SharedArrayBuffer` no escopo global (para sync APIs) no carregamento do arquivo.
- **Regra:** Usar arquivos separados por plataforma com a convenção do Metro `.web.ts` (ex: `db.web.ts`) para isolar mocks da Web e evitar que o bundle do navegador importe ou execute `expo-sqlite`.

### CH-17 — `npm install` muta o lockfile e quebra a árvore de dependências (use `npm ci`)
- **Sintoma:** após `npm install` numa máquina nova (transplante), `npm test` falhava em **todas** as
  suítes com `TypeError: isTypedArray is not a function` (lodash, via `jest-expo/src/preset/setup.js`);
  o `package-lock.json` aparecia modificado (−42 linhas).
- **Causa-raiz:** `npm install` re-resolveu dependências e **desviou do lockfile versionado**,
  instalando uma árvore inconsistente (lodash quebrado). Lint/typecheck passavam, mas o runner de testes não.
- **Regra:** ao retomar/transplantar, instalar com **`npm ci`** (determinístico, a partir do lockfile),
  **nunca** `npm install` casual. Se o lockfile já estiver modificado, restaurá-lo
  (`git checkout -- App_Dono_da_Pelada/package-lock.json`) **antes** do `npm ci`. Reverificar os gates
  (lint → typecheck → test) após instalar.
