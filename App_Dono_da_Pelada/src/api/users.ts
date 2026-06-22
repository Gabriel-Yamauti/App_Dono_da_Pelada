/**
 * Repositório de usuários — Dono da Pelada.
 *
 * Ponto único para LER e CRIAR usuários, abstraindo a plataforma:
 *  - **Nativo (iOS/Android):** SQLite via Drizzle (tabela `users`).
 *  - **Web:** usuários do seed (em memória) + usuários CRIADOS persistidos em
 *    AsyncStorage (o Expo Web não carrega `expo-sqlite` — CH-16).
 *
 * Regras do projeto (LGPD / CH-08 / CH-09 / CH-15):
 *  - **CPF é a âncora de identidade** — chave única; criar conta NUNCA
 *    sobrescreve uma existente (anti-account-takeover).
 *  - **Senha nunca em texto puro** — guardamos apenas o hash (dev) via
 *    `devPasswordHash`.
 *  - **PII nunca em logs** — este módulo não imprime CPF/senha em nenhum caso.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { Platform } from 'react-native';

import { db } from '../db/db';
import { users, type NewUser, type UserRole } from '../db/schema';
import { buildSeedUsers, isCpfValido, devPasswordHash } from '../db/seed-data';

/** Chave local (web) para as contas criadas pelo usuário (fora do seed). */
const CREATED_USERS_KEY = '@dono_da_pelada/created_users';
/** Chave local (web) para edições de perfil aplicadas por cima do seed/contas. */
const USER_OVERRIDES_KEY = '@dono_da_pelada/user_overrides';

/** Campos do perfil que podem ser editados pelo usuário. */
export type UpdateUserInput = {
  name?: string;
  phone?: string | null;
};

type Overrides = Record<string, Partial<Pick<NewUser, 'name' | 'phone'>>>;

/** Papéis oferecidos no auto-cadastro (sem `visitante`, que é só importação). */
export const SIGNUP_ROLES: UserRole[] = ['jogador', 'jogador-hoster', 'dono-campo'];

export type CreateUserInput = {
  name: string;
  /** Pode vir com pontuação; é normalizado para 11 dígitos. */
  cpf: string;
  password: string;
  role?: UserRole;
  phone?: string | null;
};

/** Mantém apenas dígitos (tolerante a CPF com pontuação — CH-10). */
function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Lê as contas criadas no armazenamento local (web). */
async function getCreatedUsersWeb(): Promise<NewUser[]> {
  try {
    const raw = await AsyncStorage.getItem(CREATED_USERS_KEY);
    return raw ? (JSON.parse(raw) as NewUser[]) : [];
  } catch {
    return [];
  }
}

/** Lê as edições de perfil (web). */
async function getOverridesWeb(): Promise<Overrides> {
  try {
    const raw = await AsyncStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

/** Aplica a edição de perfil (se houver) sobre um usuário. */
function applyOverride(u: NewUser, ov: Overrides): NewUser {
  const o = ov[u.cpf];
  return o ? { ...u, ...o } : u;
}

/**
 * Lista TODOS os usuários conhecidos (seed + criados no web; ou a tabela
 * `users` no nativo). Útil para o seletor de login e validações.
 */
export async function getAllUsers(): Promise<NewUser[]> {
  if (Platform.OS === 'web') {
    const created = await getCreatedUsersWeb();
    const ov = await getOverridesWeb();
    return [...buildSeedUsers(), ...created].map((u) => applyOverride(u, ov));
  }
  const rows = await db.select().from(users);
  return rows as NewUser[];
}

/** Busca um usuário pelo CPF (identidade — CH-09). Retorna `null` se não houver. */
export async function findUserByCpf(cpf: string): Promise<NewUser | null> {
  const normalized = onlyDigits(cpf);
  if (Platform.OS === 'web') {
    const all = await getAllUsers();
    return all.find((u) => u.cpf === normalized) ?? null;
  }
  const rows = await db.select().from(users).where(eq(users.cpf, normalized)).limit(1);
  return (rows[0] as NewUser) ?? null;
}

/**
 * Cria uma nova conta no banco local (nativo) ou no armazenamento web.
 * Valida CPF (formato + dígitos verificadores), nome e senha; impede duplicar
 * um CPF existente (anti-takeover — CH-09). Persiste só o HASH da senha (CH-08).
 * As mensagens de erro NUNCA incluem o CPF (CH-15).
 */
export async function createUser(input: CreateUserInput): Promise<NewUser> {
  const normalized = onlyDigits(input.cpf);
  if (!isCpfValido(normalized)) {
    throw new Error('CPF inválido. Confira os dígitos.');
  }

  const name = (input.name ?? '').trim();
  if (name.length < 2) {
    throw new Error('Informe um nome válido.');
  }

  if (!input.password || input.password.length < 4) {
    throw new Error('A senha deve ter ao menos 4 caracteres.');
  }

  const role: UserRole =
    input.role && SIGNUP_ROLES.includes(input.role) ? input.role : 'jogador';

  // Anti-takeover (CH-09): CPF é identidade; nunca sobrescrever conta existente.
  const existing = await findUserByCpf(normalized);
  if (existing) {
    throw new Error('Já existe uma conta com este CPF.');
  }

  const newUser: NewUser = {
    cpf: normalized,
    name,
    role,
    phone: input.phone?.trim() || null,
    passwordHash: devPasswordHash(input.password),
  };

  if (Platform.OS === 'web') {
    const created = await getCreatedUsersWeb();
    created.push(newUser);
    await AsyncStorage.setItem(CREATED_USERS_KEY, JSON.stringify(created));
  } else {
    await db.insert(users).values(newUser);
  }

  return newUser;
}

/**
 * Atualiza o perfil (nome/telefone) de um usuário (Problema H). No nativo,
 * grava na tabela `users`; no web, registra uma "override" aplicada por cima do
 * seed/contas. Valida o nome; nunca toca o CPF (identidade — CH-09).
 */
export async function updateUser(cpf: string, changes: UpdateUserInput): Promise<void> {
  const normalized = onlyDigits(cpf);
  const clean: Partial<Pick<NewUser, 'name' | 'phone'>> = {};

  if (typeof changes.name === 'string') {
    const name = changes.name.trim();
    if (name.length < 2) {
      throw new Error('Informe um nome válido.');
    }
    clean.name = name;
  }
  if (changes.phone !== undefined) {
    clean.phone = changes.phone?.trim() || null;
  }
  if (Object.keys(clean).length === 0) return;

  if (Platform.OS === 'web') {
    const ov = await getOverridesWeb();
    ov[normalized] = { ...(ov[normalized] ?? {}), ...clean };
    await AsyncStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(ov));
  } else {
    await db.update(users).set(clean).where(eq(users.cpf, normalized));
  }
}
