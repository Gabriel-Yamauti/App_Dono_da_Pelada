import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

import * as schema from './schema';

// Nome do arquivo de banco de dados SQLite local
export const DATABASE_NAME = 'dono_da_pelada.db';

// Abre ou cria o banco local
const expoDb = openDatabaseSync(DATABASE_NAME);

// Garante que a tabela 'users' exista antes de inicializar o Drizzle
expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    cpf TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'jogador',
    phone TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );
`);

// Inicializa a instância do Drizzle ORM vinculada ao nosso schema
export const db = drizzle(expoDb, { schema });
