# Módulo — Ajustes finais (estabilização de fluxos, estado e dados mocados)

> Rodada de ajustes de 2026-06-22 (variante Apenas Claude Code). 8 problemas em 6 blocos, commits
> atômicos na `02-Main-Develop`, gates verdes a cada passo (lint 0 · typecheck 0 · 47/47 testes).

## Bloco 1 — Autenticação e isolamento de sessão
- **Isolamento (Problema A):** `src/context/DataContext.tsx` passou a **escopar todo o estado por
  `user.cpf`** (chave de AsyncStorage sufixada pelo usuário, em armazenamento local). Cada conta tem seu
  store, semeado do baseline na 1ª sessão. Elimina o vazamento de ações entre usuários (CH-09).
  Testes: `src/context/__tests__/DataContext.test.tsx`.
- **Novas contas (Problema B):** novo **`src/api/users.ts`** — repositório plataforma-aware:
  `getAllUsers`/`findUserByCpf`/`createUser`/`updateUser`. Nativo = SQLite/Drizzle; web = seed +
  contas criadas + overrides de perfil em AsyncStorage. `auth.login` e `AuthContext` resolvem usuários
  pelo repositório (reconhecem contas além do seed); `signUp` cria e autentica. UI: fluxo "Criar nova
  conta" no `LoginScreen`. Segurança: valida CPF por dígitos, **impede duplicar CPF** (anti-takeover),
  guarda **só o hash** da senha, nunca expõe CPF/senha. Testes: `src/api/__tests__/users.test.ts`.

## Bloco 2 — Jogos e permissões (Hoster)
- **Gestão (Problema C):** `src/components/jogos/GestaoTimeModal.tsx` — modal real do hoster (resumo,
  elenco, **fechar/reabrir lista** [`toggleListaPartida`, estado `listaFechada`], notificar).
- **Lista de jogadores (Problema D):** `JogadoresModal.tsx` (+ `RosterList` reutilizável) e
  `roster.ts` (`buildRoster` determinístico, inclui o usuário como "(Você)"). A contagem do
  `PartidaCard` e o próximo jogo abrem a lista. Testes: `src/components/jogos/__tests__/roster.test.ts`.

## Bloco 3 — Coletivo e torneios
- **Respostas (Problema E):** modelo `Comentario`/`Resposta` no `DataContext`; mutações
  `comentarPost`/`responderComentario`; `ComentariosModal.tsx` (thread + respostas aninhadas).
- **Torneios (Problema F):** `cancelarInscricao`; `TorneioInfoModal.tsx` ("Mais Informações" +
  inscrever/cancelar); botões nos cartões. Limpeza: removidos os 4 warnings herdados do `coletivo.tsx`.

## Bloco 4 — Perfil e dados mocados
- **Ranking/Súmulas (Problema G):** súmulas injetam o nome do usuário na linha "(Você)"; `ranking.ts`
  (`buildCraques`/`computeUserStats`) monta o ranking incluindo o usuário marcado "(VOCÊ)", pelo rating
  real dele. Testes: `src/components/coletivo/__tests__/ranking.test.ts`.
- **Editar perfil (Problema H):** `updateUser` (overrides web / UPDATE nativo) + `updateProfile`
  (AuthContext) + modal de edição de nome/telefone no Perfil. O CPF (identidade) nunca muda.

## Bloco 5 — Integridade de UI, assets e botões
- 4 sinos de notificação (header) **sem `onPress`** → painel de notificações contextual; 2 placeholders
  "em desenvolvimento" → ações reais; assets de imagem por `require()` estático com fallback (conferidos).

## Bloco 6 — Validação pré-deploy
- Build de produção web (`npx expo export --platform web`) sem erro; varredura de segredos/PII limpa;
  `.gitignore` endurecido (`.env`, `*.db`, `*.sqlite`).
- **Limitação de segurança (mockup):** o login valida só a existência do CPF e **não verifica a senha**
  (hash dev, não-criptográfico). Adequado à demo do TCC; **não é auth de produção**.
