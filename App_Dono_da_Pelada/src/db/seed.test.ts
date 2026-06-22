/**
 * Testes do seed (35 usuários sintéticos) — Dono da Pelada.
 *
 * Cobrem: geração/validação de CPF sintético, distribuição de papéis,
 * idempotência do upsert por CPF (CH-10) e as garantias de PII/segredo
 * (CH-08/CH-15): nenhuma senha em texto puro, nenhum CPF em claro no relatório.
 *
 * O `seedDatabase` é exercitado contra um **fake db** que registra as chamadas
 * de upsert — não exige driver SQLite nativo nos testes.
 */
import {
  SEED_USER_COUNT,
  buildSeedReport,
  buildSeedUsers,
  devPasswordHash,
  gerarCpfSintetico,
  isCpfValido,
  maskCpf,
  seedDatabase,
  summarizeSeed,
} from './seed';
import { users } from './schema';

describe('CPF sintético', () => {
  it('gera CPF determinístico e válido (com dígitos verificadores)', () => {
    const a = gerarCpfSintetico(1);
    const b = gerarCpfSintetico(1);
    expect(a).toBe(b); // determinístico (sem Math.random)
    expect(a).toMatch(/^\d{11}$/);
    expect(isCpfValido(a)).toBe(true);
  });

  it('isCpfValido rejeita formato errado e sequências triviais', () => {
    expect(isCpfValido('123')).toBe(false);
    expect(isCpfValido('abcdefghijk')).toBe(false);
    expect(isCpfValido('11111111111')).toBe(false); // todos iguais
    expect(isCpfValido('12345678900')).toBe(false); // DV incorreto
  });
});

describe('buildSeedUsers', () => {
  const seedUsers = buildSeedUsers();

  it('gera exatamente 35 usuários', () => {
    expect(seedUsers).toHaveLength(SEED_USER_COUNT);
  });

  it('todos os CPFs são únicos e válidos', () => {
    const cpfs = new Set(seedUsers.map((u) => u.cpf));
    expect(cpfs.size).toBe(SEED_USER_COUNT);
    expect(seedUsers.every((u) => isCpfValido(u.cpf))).toBe(true);
  });

  it('cobre todos os perfis do produto (distribuição esperada)', () => {
    const { porRole } = summarizeSeed(seedUsers);
    expect(porRole).toEqual({
      'dono-campo': 5,
      'jogador-hoster': 7,
      jogador: 21,
      visitante: 2,
    });
  });

  it('NUNCA persiste senha em texto puro — só hash dev (CH-08)', () => {
    for (const u of seedUsers) {
      expect(u.passwordHash).toMatch(/^dev\$[0-9a-f]{8}$/);
      expect(u.passwordHash).not.toMatch(/pelada-/); // não vaza a senha-base
    }
  });
});

describe('devPasswordHash / maskCpf (PII & segredos)', () => {
  it('hash é determinístico e não contém a senha original', () => {
    expect(devPasswordHash('segredo123')).toBe(devPasswordHash('segredo123'));
    expect(devPasswordHash('segredo123')).not.toContain('segredo123');
  });

  it('maskCpf expõe apenas os 2 últimos dígitos', () => {
    const cpf = gerarCpfSintetico(7);
    const masked = maskCpf(cpf);
    expect(masked).toBe(`*********${cpf.slice(-2)}`);
    expect(masked).not.toContain(cpf.slice(0, 9)); // base oculta
  });
});

describe('buildSeedReport (preview do CLI)', () => {
  const relatorio = buildSeedReport();

  it('mostra o total e marca todos os CPFs como válidos', () => {
    expect(relatorio).toContain(`Total: ${SEED_USER_COUNT}`);
    expect(relatorio).toContain('Todos os CPFs válidos: sim');
  });

  // CH-15: o relatório é um artefato — nenhum CPF em claro pode aparecer.
  it('NUNCA imprime um CPF em claro (PII-safe)', () => {
    for (const u of buildSeedUsers()) {
      expect(relatorio).not.toContain(u.cpf);
    }
  });
});

/** Fake db Drizzle-like: registra os upserts sem precisar de driver SQLite. */
function createFakeDb() {
  const calls: { values: unknown; conflict: unknown }[] = [];
  const db = {
    insert(_table: unknown) {
      const record: { values: unknown; conflict: unknown } = {
        values: undefined,
        conflict: undefined,
      };
      const chain = {
        values(v: unknown) {
          record.values = v;
          return chain;
        },
        onConflictDoUpdate(cfg: unknown) {
          record.conflict = cfg;
          calls.push(record);
          return Promise.resolve();
        },
      };
      return chain;
    },
  };
  return { db, calls };
}

describe('seedDatabase (upsert por CPF — CH-10)', () => {
  it('processa os 35 usuários com onConflict no CPF (idempotente)', async () => {
    const { db, calls } = createFakeDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n1 = await seedDatabase(db as any);
    expect(n1).toBe(SEED_USER_COUNT);
    expect(calls).toHaveLength(SEED_USER_COUNT);

    // Cada chamada faz upsert tendo o CPF como alvo de conflito.
    for (const c of calls) {
      const conflict = c.conflict as { target: unknown; set: Record<string, unknown> };
      expect(conflict.target).toBe(users.cpf);
      expect(Object.keys(conflict.set)).toEqual(
        expect.arrayContaining(['name', 'role', 'phone']),
      );
      // O hash da senha NÃO é sobrescrito no update (não está no set).
      expect(conflict.set).not.toHaveProperty('passwordHash');
    }

    // Rodar de novo não lança e mantém a contagem (idempotência).
    const n2 = await seedDatabase(db as any);
    expect(n2).toBe(SEED_USER_COUNT);
  });
});
