/**
 * Testes do repositório de usuários (Problema B / CH-08 / CH-09).
 *
 * Cobre o caminho WEB (AsyncStorage): criação válida, validação de CPF/nome/
 * senha, unicidade (anti-takeover por CPF) e disciplina de PII (o CPF nunca
 * aparece em mensagens de erro; a senha nunca é persistida em texto puro).
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createUser, findUserByCpf, getAllUsers, updateUser } from '../users';
import { gerarCpfSintetico, isCpfValido, SEED_USER_COUNT } from '../../db/seed-data';

// Stub do módulo de banco: o caminho web nunca o usa, mas o import nativo
// (db.ts) carregaria expo-sqlite e quebraria no Jest (sem Metro/.web.ts).
jest.mock('../../db/db', () => ({ db: {} }));

// AsyncStorage em memória (sem ambiente nativo nos testes).
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    removeItem: jest.fn(async (k: string) => {
      delete store[k];
    }),
    __reset: () => {
      store = {};
    },
    __dump: () => ({ ...store }),
  };
});

// CPF sintético válido FORA do seed (índices 1..35 são do seed).
const NOVO_CPF = gerarCpfSintetico(500);

describe('users repository — criação de contas (web)', () => {
  beforeAll(() => {
    (Platform as any).OS = 'web';
  });

  beforeEach(() => {
    (AsyncStorage as any).__reset();
  });

  it('o CPF sintético de teste é válido e está fora do seed', async () => {
    expect(isCpfValido(NOVO_CPF)).toBe(true);
    expect(await findUserByCpf(NOVO_CPF)).toBeNull();
  });

  it('cria uma conta válida e a torna recuperável', async () => {
    const created = await createUser({
      name: 'João da Várzea',
      cpf: NOVO_CPF,
      password: 'pelada123',
      role: 'jogador-hoster',
    });

    expect(created.cpf).toBe(NOVO_CPF);
    expect(created.role).toBe('jogador-hoster');

    const found = await findUserByCpf(NOVO_CPF);
    expect(found?.name).toBe('João da Várzea');

    const all = await getAllUsers();
    expect(all).toHaveLength(SEED_USER_COUNT + 1);
  });

  it('persiste apenas o HASH da senha (nunca em texto puro — CH-08)', async () => {
    await createUser({ name: 'Maria Gol', cpf: NOVO_CPF, password: 'segredo123' });
    const dump = (AsyncStorage as any).__dump() as Record<string, string>;
    const blob = JSON.stringify(dump);
    expect(blob).not.toContain('segredo123');
    const found = await findUserByCpf(NOVO_CPF);
    expect(found?.passwordHash).toBeTruthy();
    expect(found?.passwordHash).not.toContain('segredo123');
  });

  it('rejeita CPF inválido sem expor o CPF na mensagem (CH-15)', async () => {
    const cpfInvalido = '11111111111'; // dígitos iguais → inválido
    await expect(
      createUser({ name: 'Teste', cpf: cpfInvalido, password: '1234' }),
    ).rejects.toThrow(/CPF inválido/);
    await expect(
      createUser({ name: 'Teste', cpf: cpfInvalido, password: '1234' }),
    ).rejects.not.toThrow(cpfInvalido);
  });

  it('rejeita senha curta e nome vazio', async () => {
    await expect(
      createUser({ name: 'Ana', cpf: NOVO_CPF, password: '12' }),
    ).rejects.toThrow(/senha/i);
    await expect(
      createUser({ name: '', cpf: NOVO_CPF, password: '1234' }),
    ).rejects.toThrow(/nome/i);
  });

  it('impede duplicar um CPF já existente (anti-takeover — CH-09)', async () => {
    await createUser({ name: 'Primeiro', cpf: NOVO_CPF, password: '1234' });
    await expect(
      createUser({ name: 'Impostor', cpf: NOVO_CPF, password: '5678' }),
    ).rejects.toThrow(/já existe/i);

    // O nome original permanece — não foi sobrescrito.
    const found = await findUserByCpf(NOVO_CPF);
    expect(found?.name).toBe('Primeiro');
  });
});

describe('users repository — edição de perfil (Problema H, web)', () => {
  beforeAll(() => {
    (Platform as any).OS = 'web';
  });

  beforeEach(() => {
    (AsyncStorage as any).__reset();
  });

  it('atualiza nome e telefone de um usuário do seed (override)', async () => {
    const seed = (await getAllUsers())[0];
    await updateUser(seed.cpf, { name: 'Nome Editado', phone: '11999998888' });

    const found = await findUserByCpf(seed.cpf);
    expect(found?.name).toBe('Nome Editado');
    expect(found?.phone).toBe('11999998888');
    // O CPF (identidade) permanece intacto.
    expect(found?.cpf).toBe(seed.cpf);
  });

  it('rejeita nome inválido na edição', async () => {
    const seed = (await getAllUsers())[0];
    await expect(updateUser(seed.cpf, { name: 'A' })).rejects.toThrow(/nome/i);
  });
});
