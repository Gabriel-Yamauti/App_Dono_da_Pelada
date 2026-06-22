import AsyncStorage from '@react-native-async-storage/async-storage';

import { findUserByCpf } from './users';

/**
 * Autenticação — Dono da Pelada
 *
 * Login ancorado no CPF (CH-09: CPF é a chave de identidade; nome é só
 * exibição). Persiste a sessão via AsyncStorage e valida contra o banco SQLite local.
 *
 * IMPORTANTE (LGPD / CH-08 / CH-15): o CPF é PII. NUNCA logar o CPF
 * (console.log/warn/error), nem expô-lo em mensagens de erro ou artefatos.
 */

const SESSION_KEY = '@dono_da_pelada/session';
const SESSION_CPF_KEY = '@dono_da_pelada/session_cpf';

export type Session = {
  /** Identificador da sessão derivado do CPF. */
  userId: string;
  loggedInAt: string;
};

/** Mantém apenas dígitos (tolerante a CPF com pontuação — CH-10). */
export function normalizeCpf(cpf: string): string {
  return (cpf ?? '').replace(/\D/g, '');
}

/** Valida o formato básico: 11 dígitos. */
export function isValidCpfFormat(cpf: string): boolean {
  return /^\d{11}$/.test(cpf);
}

/**
 * Deriva um identificador de usuário a partir do CPF sem persistir o CPF em claro.
 * Mockup: usa apenas os 4 últimos dígitos como sufixo opaco; o CPF completo nunca
 * é gravado nem retornado.
 */
function deriveUserId(normalizedCpf: string): string {
  return `user_${normalizedCpf.slice(-4)}`;
}

/**
 * Login. Valida o CPF contra o banco SQLite local, cria uma sessão e a persiste no AsyncStorage.
 * Em caso de CPF inválido ou não cadastrado, lança erro genérico — SEM incluir o CPF na mensagem.
 */
export async function login(cpf: string): Promise<Session> {
  const normalized = normalizeCpf(cpf);

  if (!isValidCpfFormat(normalized)) {
    throw new Error('Formato de CPF inválido.');
  }

  // Valida a existência via repositório de usuários (seed + contas criadas;
  // SQLite no nativo). Reconhece contas novas além do seed (CH-09).
  const existing = await findUserByCpf(normalized);
  if (!existing) {
    throw new Error('Usuário não cadastrado.');
  }

  const session: Session = {
    userId: deriveUserId(normalized),
    loggedInAt: new Date().toISOString(),
  };

  // Persiste a sessão principal sem o CPF em claro (PII-safe)
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Persiste o CPF em chave isolada para buscas de perfil locais
  await AsyncStorage.setItem(SESSION_CPF_KEY, normalized);

  return session;
}

/** Recupera a sessão atual, se houver. */
export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

/** Recupera o CPF da sessão atual (armazenado localmente). */
export async function getSessionCpf(): Promise<string | null> {
  return await AsyncStorage.getItem(SESSION_CPF_KEY);
}

/** Encerra a sessão. */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  await AsyncStorage.removeItem(SESSION_CPF_KEY);
}
