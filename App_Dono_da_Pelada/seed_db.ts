/**
 * CLI de seed — Dono da Pelada
 *
 * Imprime um PREVIEW PII-safe dos 35 usuários sintéticos do seed (CPF sempre
 * mascarado — CH-15), validando contagens e dígitos verificadores. NÃO toca o
 * banco: a população real é idempotente e acontece no app em runtime via
 * `seedDatabase(db)` sobre o SQLite do Expo (ver `src/db/seed.ts`).
 *
 * Uso (preview):  npm run seed:preview
 *                 (equivale a `node --experimental-strip-types seed_db.ts`)
 *
 * Sai com código 1 se a validação falhar (CPF inválido ou contagem divergente),
 * para servir de gate no CI local.
 */
import {
  buildSeedReport,
  buildSeedUsers,
  SEED_USER_COUNT,
  summarizeSeed,
} from './src/db/seed-data.ts';

const seedUsers = buildSeedUsers();
const resumo = summarizeSeed(seedUsers);

console.log(buildSeedReport(seedUsers));

const ok =
  resumo.total === SEED_USER_COUNT &&
  resumo.cpfsUnicos === SEED_USER_COUNT &&
  resumo.todosCpfsValidos;

if (!ok) {
  console.error(
    `\n[FALHA] Validação do seed: total=${resumo.total}, únicos=${resumo.cpfsUnicos}, ` +
      `válidos=${resumo.todosCpfsValidos}. Esperado ${SEED_USER_COUNT} usuários únicos e válidos.`,
  );
  process.exit(1);
}
