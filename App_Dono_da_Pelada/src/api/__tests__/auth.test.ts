import { login, getSession, logout } from '../auth';

// Mock do banco de dados para evitar carregar expo-sqlite nativo no Jest
jest.mock('../../db/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve([{ cpf: '12345678909', name: 'User Test', role: 'jogador' }])),
        })),
      })),
    })),
  },
}));

// Mock do AsyncStorage (não há ambiente nativo nos testes).
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
  };
});

const CPF = '12345678909';

describe('auth (mockup)', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('cria e persiste uma sessão ao logar com CPF válido', async () => {
    const session = await login(CPF);
    expect(session.userId).toBeDefined();
    expect(await getSession()).toEqual(session);
    await logout();
  });

  // CH-08 / CH-09 / LGPD: o CPF é PII e NUNCA pode ser logado.
  it('NUNCA loga o CPF (nenhum console recebe o CPF)', async () => {
    await login(CPF);

    const allArgs = [logSpy, warnSpy, errorSpy, infoSpy]
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    expect(allArgs).not.toContain(CPF);
    await logout();
  });

  // O CPF também não pode escapar via mensagem de erro.
  it('não inclui o CPF na mensagem de erro de CPF inválido', async () => {
    const cpfInvalido = '999';
    await expect(login(cpfInvalido)).rejects.toThrow();
    await expect(login(cpfInvalido)).rejects.not.toThrow(cpfInvalido);
  });

  // A sessão persistida não pode conter o CPF em claro.
  it('não persiste o CPF em claro na sessão', async () => {
    await login(CPF);
    const raw = JSON.stringify(await getSession());
    expect(raw).not.toContain(CPF);
    await logout();
  });
});
