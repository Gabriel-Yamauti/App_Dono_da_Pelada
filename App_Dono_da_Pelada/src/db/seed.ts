/**
 * Camada de banco do seed (SQLite + Drizzle) — Dono da Pelada.
 *
 * A geração PURA dos 35 usuários sintéticos vive em `./seed-data` (sem Drizzle);
 * aqui ficam só as operações que tocam o banco. Reexportamos a API pura para que
 * `import ... from './db/seed'` continue funcionando como ponto único.
 *
 * Regras aplicadas: CPF é a âncora de identidade (CH-09); idempotência via
 * **upsert por CPF** (CH-10); PII/segredos nunca expostos (CH-08/CH-15) — ver
 * `./seed-data`.
 */
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import { buildSeedUsers } from './seed-data';
import { users } from './schema';

// API pura (geração/validação/relatório) reexportada deste módulo.
export * from './seed-data';

/**
 * Popula o banco via Drizzle com **upsert por CPF** (idempotente — CH-10).
 * Chamado em runtime com a instância `drizzle(expo-sqlite)` do app.
 * Retorna a quantidade de usuários processados.
 */
export async function seedDatabase(
  db: BaseSQLiteDatabase<'sync' | 'async', unknown>,
): Promise<number> {
  const seedUsers = buildSeedUsers();
  for (const u of seedUsers) {
    await db
      .insert(users)
      .values(u)
      .onConflictDoUpdate({
        target: users.cpf,
        set: { name: u.name, role: u.role, phone: u.phone },
      });
  }
  return seedUsers.length;
}
