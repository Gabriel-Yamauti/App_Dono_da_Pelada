/**
 * Geração de dados do seed (PURO, sem Drizzle/SQLite) — Dono da Pelada.
 *
 * Aqui ficam apenas funções determinísticas e livres de I/O: geração/validação
 * de CPF sintético, hash dev de senha, máscara de PII e a construção dos 35
 * usuários. Por não importar nenhum VALOR do schema (só TIPOS, apagados em
 * runtime), este módulo roda em qualquer ambiente — inclusive o CLI puro
 * (`seed_db.ts`) via `node --experimental-strip-types`, sem carregar o banco.
 *
 * Regras do projeto aplicadas:
 *  - **CPF é a âncora de identidade** (CH-09) — os CPFs aqui são SINTÉTICOS
 *    (dígitos verificadores válidos, porém fictícios; não são de pessoas reais).
 *  - **PII/LGPD (CH-08/CH-15):** nunca expor o CPF em claro — use `maskCpf`.
 *  - **Senha nunca em texto puro (CH-08):** guardamos só um hash (dev-only).
 */
import type { NewUser, UserRole } from './schema';

/** Quantidade de usuários gerados pelo seed. */
export const SEED_USER_COUNT = 35;

/**
 * Distribuição de papéis (soma = 35). Cobre todos os perfis do produto,
 * com maioria de jogadores comuns, como na várzea real.
 */
const ROLE_PLAN: { role: UserRole; quantidade: number }[] = [
  { role: 'dono-campo', quantidade: 5 },
  { role: 'jogador-hoster', quantidade: 7 },
  { role: 'jogador', quantidade: 21 },
  { role: 'visitante', quantidade: 2 },
];

const PRIMEIROS_NOMES = [
  'Lucas', 'Gabriel', 'Mateus', 'Rafael', 'Bruno', 'Thiago', 'Felipe', 'Pedro',
  'Gustavo', 'André', 'Diego', 'Vinícius', 'Caio', 'Rodrigo', 'Marcelo',
  'Eduardo', 'Fernando', 'Leonardo', 'Daniel', 'Henrique', 'Igor', 'Murilo',
  'Otávio', 'Ricardo', 'Samuel', 'Vitor', 'Wesley', 'Yuri', 'Alan', 'Breno',
  'César', 'Davi', 'Enzo', 'Fábio', 'Júlio',
];

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Costa', 'Almeida',
  'Ferreira', 'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Barbosa', 'Ribeiro',
  'Carvalho', 'Teixeira', 'Cardoso', 'Rocha', 'Dias', 'Nunes', 'Moraes',
  'Castro', 'Campos', 'Pinto', 'Mendes', 'Freitas', 'Vieira', 'Monteiro',
  'Cavalcante', 'Andrade', 'Correia', 'Nascimento', 'Ramos', 'Azevedo',
];

/** Calcula um dígito verificador de CPF a partir dos dígitos-base. */
function digitoVerificador(base: number[]): number {
  let fator = base.length + 1;
  const soma = base.reduce((acc, d) => acc + d * fator--, 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/**
 * Gera um CPF SINTÉTICO (11 dígitos) com dígitos verificadores válidos,
 * determinístico a partir de `seed`. Os 3 primeiros dígitos derivam do índice
 * para garantir unicidade dentro do seed.
 */
export function gerarCpfSintetico(seed: number): string {
  const base: number[] = [];
  // Prefixo determinístico pelo índice → unicidade entre os 35 usuários.
  base.push(Math.floor(seed / 10) % 10, seed % 10, (seed * 3 + 1) % 10);
  // Demais dígitos via LCG determinístico (sem Math.random → reprodutível).
  let x = seed * 2654435761 + 1013904223;
  for (let i = 0; i < 6; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    base.push(x % 10);
  }
  const d1 = digitoVerificador(base);
  const d2 = digitoVerificador([...base, d1]);
  return [...base, d1, d2].join('');
}

/**
 * Valida um CPF (somente dígitos) por formato **e** dígitos verificadores.
 * Rejeita sequências triviais (todos os dígitos iguais).
 */
export function isCpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const dig = cpf.split('').map(Number);
  const base = dig.slice(0, 9);
  const d1 = digitoVerificador(base);
  const d2 = digitoVerificador([...base, d1]);
  return d1 === dig[9] && d2 === dig[10];
}

/**
 * Hash de senha **dev-only** (não-criptográfico, FNV-1a). Existe apenas para
 * nunca persistir a senha em texto puro no seed (CH-08). O back-end real
 * substituirá por um KDF (bcrypt/argon2).
 */
export function devPasswordHash(senha: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < senha.length; i++) {
    h ^= senha.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `dev$${(h >>> 0).toString(16).padStart(8, '0')}`;
}

/** Mascara o CPF para relatórios/logs (CH-15): expõe só os 2 últimos dígitos. */
export function maskCpf(cpf: string): string {
  return `*********${cpf.slice(-2)}`;
}

/**
 * Constrói (de forma pura e determinística) os 35 usuários do seed.
 * Sem efeitos colaterais — ideal para testes.
 */
export function buildSeedUsers(): NewUser[] {
  const roles = ROLE_PLAN.flatMap(({ role, quantidade }) =>
    Array.from({ length: quantidade }, () => role),
  );

  return roles.map((role, i) => {
    const nome = `${PRIMEIROS_NOMES[i % PRIMEIROS_NOMES.length]} ${
      SOBRENOMES[i % SOBRENOMES.length]
    }`;
    const cpf = gerarCpfSintetico(i + 1);
    // DDD 11 + número sintético determinístico (não é telefone real).
    const phone = `11${(900000000 + i * 12345).toString().slice(0, 9)}`;
    return {
      cpf,
      name: nome,
      role,
      phone,
      passwordHash: devPasswordHash(`pelada-${role}-${i}`),
    } satisfies NewUser;
  });
}

/** Resumo agregável do seed (sem expor CPF) — útil para CLI e validações. */
export function summarizeSeed(seedUsers: NewUser[] = buildSeedUsers()) {
  const porRole = seedUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role ?? 'jogador'] = (acc[u.role ?? 'jogador'] ?? 0) + 1;
    return acc;
  }, {});
  return {
    total: seedUsers.length,
    porRole,
    cpfsUnicos: new Set(seedUsers.map((u) => u.cpf)).size,
    todosCpfsValidos: seedUsers.every((u) => isCpfValido(u.cpf)),
  };
}

/**
 * Relatório textual do seed para o CLI (`seed_db.ts`). **PII-safe (CH-15):** o
 * CPF aparece SEMPRE mascarado (`maskCpf`), nunca em claro; a senha/hash nunca
 * é impressa. Usado tanto pela linha de comando quanto pelos testes.
 */
export function buildSeedReport(seedUsers: NewUser[] = buildSeedUsers()): string {
  const resumo = summarizeSeed(seedUsers);
  const linhas = seedUsers.map((u, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `  ${n}  ${maskCpf(u.cpf)}  ${(u.role ?? 'jogador').padEnd(14)}  ${u.name}`;
  });
  return [
    'Dono da Pelada — Seed do banco local (preview PII-safe)',
    '='.repeat(56),
    `Total: ${resumo.total}   |   CPFs únicos: ${resumo.cpfsUnicos}   |   ` +
      `Todos os CPFs válidos: ${resumo.todosCpfsValidos ? 'sim' : 'NÃO'}`,
    `Distribuição por papel: ${JSON.stringify(resumo.porRole)}`,
    '-'.repeat(56),
    ...linhas,
    '='.repeat(56),
    'Obs.: o seed real é idempotente (upsert por CPF — CH-10) e roda no app via',
    'seedDatabase(db) sobre o SQLite do Expo. Este preview não toca o banco.',
  ].join('\n');
}
