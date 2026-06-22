/**
 * Schema do banco de dados local (SQLite + Drizzle ORM).
 *
 * Fonte de verdade do modelo de dados. As migrações são geradas a partir
 * daqui (`drizzle-kit`, ver `drizzle.config.ts`) e o app consome o banco via
 * `drizzle-orm/expo-sqlite` em runtime nativo.
 *
 * Regras do projeto aplicadas neste schema:
 *  - **CPF é a âncora de identidade** (chave primária). O nome é apenas
 *    exibição e nunca deve ser usado para autenticar (CH-09).
 *  - **CPF/PII (LGPD):** o CPF é minimizado e nunca exposto em logs/artefatos;
 *    a senha é guardada apenas como hash, nunca em texto puro (CH-08/CH-15).
 */
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Papéis possíveis de um usuário no app.
 *  - `visitante`     → importado/não verificado (ex.: upsert por CSV — CH-10);
 *  - `jogador`       → usuário verificado padrão;
 *  - `jogador-hoster`→ jogador que também organiza peladas;
 *  - `dono-campo`    → dono de campo (marketplace de reservas).
 */
export const USER_ROLES = [
  'visitante',
  'jogador',
  'jogador-hoster',
  'dono-campo',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Tabela de usuários. `cpf` (apenas dígitos, 11 chars) é a chave primária —
 * âncora de identidade entre dispositivos (CH-09).
 */
export const users = sqliteTable('users', {
  /** CPF somente dígitos (11 caracteres). Chave primária / identidade. */
  cpf: text('cpf').primaryKey(),
  /** Nome de exibição. Nunca usado para autenticação. */
  name: text('name').notNull(),
  /** Hash da senha. NUNCA armazenar a senha em texto puro (CH-08). */
  passwordHash: text('password_hash').notNull(),
  /** Papel do usuário; default `jogador`. */
  role: text('role', { enum: USER_ROLES }).notNull().default('jogador'),
  /** Telefone de contato (opcional). */
  phone: text('phone'),
  /** Criação (epoch ms). */
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  /** Última atualização (epoch ms). */
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Linha completa da tabela `users` (inclui o hash — uso interno). */
export type User = typeof users.$inferSelect;
/** Dados aceitos ao inserir um usuário. */
export type NewUser = typeof users.$inferInsert;
