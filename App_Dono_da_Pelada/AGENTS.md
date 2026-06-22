---
documento: AGENTS.md
titulo: "Regras Agnósticas para Qualquer IA que Toque o Repositório (variante Apenas Claude Code)"
versao: 2.0-claude
data: 2026-06-22
papel: "Convenções imutáveis de Git LOCAL, proibições absolutas, padrões de commit, lint/test e política de segurança/segredos. Vale para o Claude Code e todos os seus subagentes."
quem_me_le: "O Claude Code e todo subagente antes de tocar no repositório; e o operador humano (navegador)."
quando: "Antes de qualquer operação no repositório; reler em caso de dúvida sobre git/segurança."
ler_antes: ["Modo_Operante.md", "CLAUDE.md", "MAP.md"]
ler_depois: ["Metodo_Modo_Operante_v2/SECURITY.md", "Metodo_Modo_Operante_v2/TESTING.md"]
estavel_ate: "fim (documento estável)"
variante: "APENAS CLAUDE CODE — sem Antigravity/Gemini. Variante original preservada em ../Modo_Operante_Antigravity_Claude/."
---

# AGENTS.md — Regras Duras (variante Apenas Claude Code)

> Estas regras são **vinculantes e inegociáveis**. Quem as viola corrompe o projeto. Em conflito com
> qualquer outra instrução de menor nível, **estas prevalecem** (exceto ordem explícita do humano G).

> **Papéis nesta variante:** o **operador humano (G)** é o **navegador** (decisões macro, portões,
> troca de modelo). O **Claude Code** é o **executor + orquestrador tático**: escreve todo o código,
> faz o git local, roda os gates e coordena subagentes. Não há Antigravity/segunda IA.

## 1. Proibições absolutas

1. **O NAVEGADOR HUMANO NÃO EDITA CÓDIGO NA MÃO.** Todo código e teste é criado/editado pelo **Claude
   Code** (sessão principal ou subagentes). O humano dirige, decide, valida e aprova — não cola
   correções manuais no código (mantém a base coerente e a telemetria de qualidade limpa).
2. **NADA de rede até o portão de deploy (§ Modo_Operante 10).** Proibido `git push`, `git remote add`,
   deploy, `npm publish` ou qualquer chamada de rede de produção durante o desenvolvimento. (Instalar
   dependências locais é permitido.)
3. **A pasta `Referencias_Pasta_NAO_Alterada/` é IMUTÁVEL.** Nunca criar, editar, mover ou apagar nada
   dentro dela. O que for necessário é **copiado** para a área de trabalho e usado da cópia.
4. **Nunca apagar arquivos do usuário nem mutar o banco** sem autorização explícita registrada.
5. **Nunca gravar segredos** (senhas, chaves de API, tokens, CPFs reais) em código, `.md` ou git.
6. **Nunca "deixar para depois" um erro de build/teste sem corrigir.** Se um gate falha, o Claude Code
   corrige (na própria sessão ou re-despachando o log a um subagente) e/ou **sobe de modelo** — não se
   commita em cima de um gate vermelho.
7. **Nunca silenciar alerta de segurança** sem justificativa documentada (falso-positivo registrado).

## 2. Git — 100% LOCAL (até o portão de deploy)

- **Topologia de branches:**
  - `02-Main-Develop` — branch de trabalho; todo desenvolvimento e os subagentes operam aqui (ou em
    **worktrees** derivados dela).
  - `main` — estável, 100% validada (testes + segurança verdes). Merge só após os gates, sob a
    estratégia decidida pelo navegador humano.
  - `01-Main-BackUp` — backup local; sincronizar **imediatamente após cada merge** bem-sucedido na `main`.
- **Paralelismo:** cada subagente/terminal em seu **git worktree/branch** para não conflitar;
  sincronizar com merges pequenos; resolver conflitos antes do próximo lote.
- **Commits atômicos + Conventional Commits:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `chore:`, `sec:`. Uma unidade lógica por commit; **sem big-bang merge**.
- **Cadência:** commitar com frequência (não acumular); a **documentação precede o merge na `main`**.
- **`.gitignore`** robusto desde o 1º commit (env, segredos, build, node_modules, artefatos).

## 3. Portões de qualidade por commit (CI local)

Ordem obrigatória a cada commit na `02-Main-Develop` (bloqueia em falha):
1. **Lint** + **type-check** (ESLint + TypeScript).
2. **SAST** (ex.: Semgrep/CodeQL) — análise estática de segurança.
3. **SCA + segredos** (ex.: npm audit/OSV-Scanner + gitleaks/trufflehog).
4. **Testes** (unit + integração; E2E nos marcos). Razão teste/código ~1.5×.

Falhou qualquer um → **não comita**; o Claude Code corrige (direto ou via subagente). Detalhe em
`Metodo_Modo_Operante_v2/SECURITY.md` e `TESTING.md`.

## 4. Política de segredos (DURA — CH-08)

- Segredos só em **variáveis de ambiente** / gerenciador de segredos; nunca no repo.
- Se um segredo for exposto: **rotacionar/revogar imediatamente**, remover do histórico, e registrar
  **apenas o fato** no `Diario_de_Bordo_TCC.md` (jamais o valor).
- PII (CPF/nome): minimizar, criptografar, nunca em logs/PDF/`.md`/git (CH-09/CH-15).

## 5. Documentação e registro (obrigatório)

- `CLAUDE.md` › Common Hurdles atualizado a cada lição (sintoma→causa→regra), **ao fim**.
- `MAP.md` › mapa de módulos atualizado a cada módulo novo.
- `HANDOFF.md` reescrito a cada marco/merge na `main` e ao fim de cada sessão.
- `Diario_de_Bordo_TCC.md` em **registro contemporâneo append-only** (não reescrever entradas antigas).

## 6. Skills e ferramentas

- Baixar/criar **skills e subagentes sob demanda** por tarefa (UI/UX, front-end, segurança, testes),
  **auditando antes** (evitar "fruit salad" e pacotes adulterados).
- Preferir **comandos/recursos nativos** do Claude Code para economizar tokens (`/compact`, `/clear`,
  `/agents`, `/context`, `/cost`, `/model`). Para paralelismo: **subagentes (Task/Agent)**, **git
  worktrees** e **múltiplos terminais** (lembrando que todos consomem o mesmo balde de uso — §3).

## 7. Pausas obrigatórias

- **Portão de deploy** (§ Modo_Operante 10): parar e pedir "pode ir" humano.
- **Recurso insustentável** (§ Modo_Operante 3): pausar e avisar o humano; registrar o fato.
- **Ambiguidade de dado de fonte** (CH-07): verificar/registrar antes de seguir.
