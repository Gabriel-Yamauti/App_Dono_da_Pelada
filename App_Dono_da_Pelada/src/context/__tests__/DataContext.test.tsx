/**
 * Testes de ISOLAMENTO de estado por usuário (Problema A / CH-09).
 *
 * Garante que uma ação de um usuário (ex.: reservar campo) é gravada num store
 * ESCOPADO pelo CPF da sessão e NÃO vaza para outro usuário. Esta é a rede de
 * proteção do `DataContext` escopado por usuário.
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DataProvider, useData, type DataContextType as DataContextValue } from '../DataContext';

// Identidade ativa controlável por teste (substitui o AuthContext real).
let mockUser: { cpf: string; name: string; role: string } | null = null;
jest.mock('../AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

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

const USER_A = { cpf: '11111111111', name: 'Usuário A', role: 'jogador' };
const USER_B = { cpf: '22222222222', name: 'Usuário B', role: 'jogador' };

// Sink mutável passado por PROP (não global) — o probe captura o valor do
// contexto a cada render. Evita reatribuir variável de módulo dentro do
// componente (regra react-hooks/globals) e contorna o renderHook, instável no
// jest-expo + React 19.
type Sink = { current?: DataContextValue };
function Probe({ sinkRef }: { sinkRef: Sink }) {
  const value = useData();
  // Captura via efeito (não em render) para respeitar a pureza de render
  // exigida pelas regras do React Compiler. O nome terminado em "Ref" sinaliza
  // ao linter que esta caixa mutável é intencional (heurística react-hooks).
  React.useEffect(() => {
    sinkRef.current = value;
  }, [sinkRef, value]);
  return null;
}

describe('DataContext — isolamento por usuário (CH-09)', () => {
  beforeEach(() => {
    (AsyncStorage as any).__reset();
    mockUser = null;
  });

  it('grava a reserva apenas no store escopado pelo CPF do usuário', async () => {
    const capA: Sink = {};
    mockUser = USER_A;
    await act(async () => {
      render(
        <DataProvider>
          <Probe sinkRef={capA} />
        </DataProvider>,
      );
    });

    await act(async () => {
      await capA.current!.reservarCampo('c1', 'Hoje', '19:00');
    });

    expect(capA.current!.reservas).toHaveLength(1);

    const dump = (AsyncStorage as any).__dump() as Record<string, string>;
    const keys = Object.keys(dump);
    // A reserva foi para a chave escopada do usuário A...
    expect(keys.some((k) => k.includes(USER_A.cpf))).toBe(true);
    // ...e NÃO existe nenhuma chave de reservas sem escopo (global).
    expect(keys.some((k) => k.endsWith('/reservas'))).toBe(false);
  });

  it('não vaza a reserva de um usuário para outro', async () => {
    // Usuário A reserva.
    const capA: Sink = {};
    mockUser = USER_A;
    await act(async () => {
      render(
        <DataProvider>
          <Probe sinkRef={capA} />
        </DataProvider>,
      );
    });
    await act(async () => {
      await capA.current!.reservarCampo('c1', 'Hoje', '19:00');
    });
    expect(capA.current!.reservas).toHaveLength(1);

    // Usuário B abre o app: começa SEM reservas (store isolado).
    const capB: Sink = {};
    mockUser = USER_B;
    await act(async () => {
      render(
        <DataProvider>
          <Probe sinkRef={capB} />
        </DataProvider>,
      );
    });
    await waitFor(() => {
      expect(capB.current!.reservas).toHaveLength(0);
    });
  });
});

describe('DataContext — comentários, respostas e torneios (Bloco 3)', () => {
  beforeEach(() => {
    (AsyncStorage as any).__reset();
    mockUser = USER_A;
  });

  async function montar(): Promise<Sink> {
    const cap: Sink = {};
    await act(async () => {
      render(
        <DataProvider>
          <Probe sinkRef={cap} />
        </DataProvider>,
      );
    });
    return cap;
  }

  it('adiciona um comentário e incrementa a contagem do post', async () => {
    const cap = await montar();
    const post = cap.current!.posts[0];
    const antes = post.comentarios?.length ?? 0;
    await act(async () => {
      await cap.current!.comentarPost(post.id, 'Bora pra cima!', 'Usuário A');
    });
    const atual = cap.current!.posts[0];
    expect(atual.comentarios).toHaveLength(antes + 1);
    expect(atual.comentarios![antes].texto).toBe('Bora pra cima!');
    expect(atual.commentsCount).toBe(post.commentsCount + 1);
  });

  it('adiciona uma resposta a um comentário existente', async () => {
    const cap = await montar();
    const post = cap.current!.posts.find((p) => (p.comentarios?.length ?? 0) > 0)!;
    const comentario = post.comentarios![0];
    const respAntes = comentario.respostas.length;
    await act(async () => {
      await cap.current!.responderComentario(post.id, comentario.id, 'Concordo!', 'Usuário A');
    });
    const atual = cap.current!.posts.find((p) => p.id === post.id)!;
    expect(atual.comentarios![0].respostas).toHaveLength(respAntes + 1);
    expect(atual.comentarios![0].respostas[respAntes].texto).toBe('Concordo!');
  });

  it('cancela a inscrição em um torneio', async () => {
    const cap = await montar();
    const inscrito = cap.current!.torneios.find((tr) => tr.inscrito)!;
    await act(async () => {
      await cap.current!.cancelarInscricao(inscrito.id);
    });
    const atual = cap.current!.torneios.find((tr) => tr.id === inscrito.id)!;
    expect(atual.inscrito).toBe(false);
  });
});
