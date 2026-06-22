import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';

export type Partida = {
  id: string;
  titulo: string;
  local: string;
  quando: string;
  vagas: { ocupadas: number; total: number };
  status: 'hoster' | 'confirmada' | 'aberta' | 'encerrada';
  placar?: string;
  confirmado?: boolean;
  gols?: number;
  assistencias?: number;
  rating?: number;
  mvp?: boolean;
  /** Lista de presença fechada pelo hoster (gestão do time). */
  listaFechada?: boolean;
};

export type Campo = {
  id: string;
  nome: string;
  bairro: string;
  precoHora: number;
  nota: number;
  avaliacoes: number;
  horarios: string[];
  comodidades: string[];
  tipo: string;
  destaque: boolean;
};

export type Resposta = {
  id: string;
  autor: string;
  texto: string;
  tempo: string;
};

export type Comentario = {
  id: string;
  autor: string;
  texto: string;
  tempo: string;
  respostas: Resposta[];
};

export type Post = {
  id: string;
  name: string;
  time: string;
  content: string;
  likes: number;
  commentsCount: number;
  liked: boolean;
  comentarios?: Comentario[];
};

export type Torneio = {
  id: string;
  nome: string;
  inscrito: boolean;
  nextMatch?: string;
  local?: string;
  deadline?: string;
  categoria?: string;
};

export type Reserva = {
  id: string;
  campoId: string;
  campoNome: string;
  data: string;
  horario: string;
  preco: number;
};

export type DataContextType = {
  partidas: Partida[];
  campos: Campo[];
  posts: Post[];
  torneios: Torneio[];
  reservas: Reserva[];
  togglePresenca: (partidaId: string) => Promise<void>;
  toggleListaPartida: (partidaId: string) => Promise<void>;
  adicionarPost: (name: string, content: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  comentarPost: (postId: string, texto: string, autor: string) => Promise<void>;
  responderComentario: (postId: string, comentarioId: string, texto: string, autor: string) => Promise<void>;
  reservarCampo: (campoId: string, data: string, horario: string) => Promise<void>;
  inscreverTorneio: (torneioId: string) => Promise<void>;
  cancelarInscricao: (torneioId: string) => Promise<void>;
  criarPartida: (titulo: string, local: string, quando: string, totalVagas: number) => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Dados MOCK Iniciais do Figma ---
const INITIAL_PARTIDAS: Partida[] = [
  {
    id: 'p-proximo',
    titulo: 'Copa SC - Oitavas de Final',
    local: 'Amigos & Bola - Society',
    quando: '15/05 | 22:00',
    vagas: { ocupadas: 12, total: 14 },
    status: 'hoster',
    confirmado: true,
  },
  {
    id: 'p-futura-1',
    titulo: 'Copa SC - Quartas de Final',
    local: 'Perea, São Carlos',
    quando: 'Amanhã · 21:30',
    vagas: { ocupadas: 8, total: 14 },
    status: 'confirmada',
    confirmado: true,
  },
  {
    id: 'p-futura-2',
    titulo: 'Treino Tático - Squad Alpha',
    local: 'Arena Central Society',
    quando: 'Sáb, 26 Abr · 08:00',
    vagas: { ocupadas: 10, total: 12 },
    status: 'aberta',
    confirmado: false,
  },
  {
    id: 'p-passada-1',
    titulo: 'Paulistão Várzea - Rodada 5',
    local: 'Arena Central Society',
    quando: '5 Abr 2026',
    vagas: { ocupadas: 14, total: 14 },
    status: 'encerrada',
    placar: '4 x 2',
    gols: 2,
    assistencias: 1,
    rating: 8.5,
    mvp: true,
  },
  {
    id: 'p-passada-2',
    titulo: 'Clássico Amistoso FC',
    local: 'Perea, São Carlos',
    quando: '29 Mar 2026',
    vagas: { ocupadas: 14, total: 14 },
    status: 'encerrada',
    placar: '2 x 5',
    gols: 1,
    assistencias: 0,
    rating: 6.1,
    mvp: false,
  },
];

const INITIAL_CAMPOS: Campo[] = [
  {
    id: 'c1',
    nome: 'Arena Gol de Ouro',
    bairro: 'Vila Madalena',
    precoHora: 140,
    nota: 4.7,
    avaliacoes: 84,
    horarios: ['19:00', '20:00', '21:00'],
    comodidades: ['Vestiário', 'Estacionamento', 'Churrasqueira'],
    tipo: 'Society 7 · sintético',
    destaque: true,
  },
  {
    id: 'c2',
    nome: 'Amigos & Bola - Society',
    bairro: 'Perea, São Carlos',
    precoHora: 120,
    nota: 4.5,
    avaliacoes: 62,
    horarios: ['18:00', '19:00', '22:00'],
    comodidades: ['Vestiário', 'Estacionamento'],
    tipo: 'Society 7 · sintético',
    destaque: false,
  },
  {
    id: 'c3',
    nome: 'Arena Central Society',
    bairro: 'Centro',
    precoHora: 150,
    nota: 4.8,
    avaliacoes: 110,
    horarios: ['20:00', '21:00', '22:00'],
    comodidades: ['Vestiário', 'Churrasqueira', 'Wi-Fi'],
    tipo: 'Society 9 · sintético',
    destaque: true,
  },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    name: 'Ricardo dos Santos Oliveira',
    time: '5 horas atrás',
    content: 'Jogamos muito hoje! O time está voando na Copa SC. Vamos com tudo para as quartas de final! ⚽🏆 #Várzea #FutebolRaiz',
    likes: 42,
    commentsCount: 2,
    liked: false,
    comentarios: [
      {
        id: 'c1',
        autor: 'Lucas Silva',
        texto: 'Vamos com tudo! O time tá afiado demais. 🔥',
        tempo: '4 horas atrás',
        respostas: [
          {
            id: 'r1',
            autor: 'Mateus Oliveira',
            texto: 'Isso aí, Lucas! Bola pra frente.',
            tempo: '3 horas atrás',
          },
        ],
      },
      {
        id: 'c2',
        autor: 'Gabriel Santos',
        texto: 'Quartas de final, lá vamos nós!',
        tempo: '2 horas atrás',
        respostas: [],
      },
    ],
  },
  {
    id: 'post2',
    name: 'Resenha F.C.',
    time: '1 dia atrás',
    content: 'NOVA CONQUISTA DA COMUNIDADE - REIS DO GRAMADO! Resenha F.C. bateu a marca de 50 partidas oficiais com 85% de assiduidade média! Parabéns a todos os atletas envolvidos. 📈🔥',
    likes: 88,
    commentsCount: 1,
    liked: false,
    comentarios: [
      {
        id: 'c3',
        autor: 'Diego Souza',
        texto: 'Parabéns ao time! Exemplo de comprometimento. 👏',
        tempo: '20 horas atrás',
        respostas: [],
      },
    ],
  },
];

const INITIAL_TORNEIOS: Torneio[] = [
  {
    id: 't1',
    nome: 'Paulistão 2024',
    inscrito: true,
    nextMatch: '24 JUN | 20:30 contra Red Bull Bragantino',
  },
  {
    id: 't2',
    nome: 'Torneio Relâmpago Ipiranga',
    inscrito: true,
    nextMatch: '12 JUL | 09:00 contra Oitavas de Final',
  },
  {
    id: 't3',
    nome: 'SUPER BOWL DA LESTE',
    inscrito: false,
    local: 'Arena Itaquera, Z/L São Paulo',
    deadline: '30 de Abril',
    categoria: 'Semi-Pro',
  },
];

// Entidades persistidas. Cada uma é gravada em uma chave ESCOPADA POR USUÁRIO
// (sufixo = CPF da sessão), garantindo isolamento total entre contas (CH-09):
// a ação de um usuário (confirmar jogo, reservar, curtir) nunca vaza para outro.
const STORAGE_PREFIX = '@dono_da_pelada';
const ENTITIES = {
  PARTIDAS: 'partidas',
  POSTS: 'posts',
  TORNEIOS: 'torneios',
  RESERVAS: 'reservas',
} as const;

/**
 * Monta a chave de armazenamento local escopada por usuário. O `userKey` é o
 * CPF da sessão — usado SOMENTE como sufixo de chave em armazenamento LOCAL do
 * dispositivo (nunca em logs/PDF/.md/git — CH-09/CH-15).
 */
function scopedKey(entity: string, userKey: string): string {
  return `${STORAGE_PREFIX}/${entity}::${userKey}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Identidade ativa: todo o estado abaixo é isolado por este CPF (CH-09).
  const { user } = useAuth();
  const userKey = user?.cpf ?? null;

  const [partidas, setPartidas] = useState<Partida[]>(INITIAL_PARTIDAS);
  const [campos] = useState<Campo[]>(INITIAL_CAMPOS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [torneios, setTorneios] = useState<Torneio[]>(INITIAL_TORNEIOS);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Recarrega o estado SEMPRE que o usuário logado muda (login/troca/logout).
  // Sem usuário → volta ao baseline (sem tocar persistência). Com usuário →
  // carrega o store dele (ou semeia do baseline na primeira sessão).
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      if (!userKey) {
        setPartidas(INITIAL_PARTIDAS);
        setPosts(INITIAL_POSTS);
        setTorneios(INITIAL_TORNEIOS);
        setReservas([]);
        return;
      }
      try {
        const [sp, spo, sto, sre] = await Promise.all([
          AsyncStorage.getItem(scopedKey(ENTITIES.PARTIDAS, userKey)),
          AsyncStorage.getItem(scopedKey(ENTITIES.POSTS, userKey)),
          AsyncStorage.getItem(scopedKey(ENTITIES.TORNEIOS, userKey)),
          AsyncStorage.getItem(scopedKey(ENTITIES.RESERVAS, userKey)),
        ]);
        if (cancelled) return;
        setPartidas(sp ? JSON.parse(sp) : INITIAL_PARTIDAS);
        setPosts(spo ? JSON.parse(spo) : INITIAL_POSTS);
        setTorneios(sto ? JSON.parse(sto) : INITIAL_TORNEIOS);
        setReservas(sre ? JSON.parse(sre) : []);
      } catch {
        // Silencioso e PII-safe (CH-08/CH-15): nunca logar dados sensíveis.
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [userKey]);

  const savePartidas = async (newPartidas: Partida[]) => {
    setPartidas(newPartidas);
    if (userKey) {
      await AsyncStorage.setItem(scopedKey(ENTITIES.PARTIDAS, userKey), JSON.stringify(newPartidas));
    }
  };

  const savePosts = async (newPosts: Post[]) => {
    setPosts(newPosts);
    if (userKey) {
      await AsyncStorage.setItem(scopedKey(ENTITIES.POSTS, userKey), JSON.stringify(newPosts));
    }
  };

  const saveTorneios = async (newTorneios: Torneio[]) => {
    setTorneios(newTorneios);
    if (userKey) {
      await AsyncStorage.setItem(scopedKey(ENTITIES.TORNEIOS, userKey), JSON.stringify(newTorneios));
    }
  };

  const saveReservas = async (newReservas: Reserva[]) => {
    setReservas(newReservas);
    if (userKey) {
      await AsyncStorage.setItem(scopedKey(ENTITIES.RESERVAS, userKey), JSON.stringify(newReservas));
    }
  };

  const togglePresenca = async (partidaId: string) => {
    const updated = partidas.map((p) => {
      if (p.id === partidaId) {
        const confirmado = !p.confirmado;
        const ocupadas = confirmado
          ? Math.min(p.vagas.total, p.vagas.ocupadas + 1)
          : Math.max(0, p.vagas.ocupadas - 1);
        return {
          ...p,
          confirmado,
          vagas: { ...p.vagas, ocupadas },
        };
      }
      return p;
    });
    await savePartidas(updated);
  };

  const toggleListaPartida = async (partidaId: string) => {
    const updated = partidas.map((p) =>
      p.id === partidaId ? { ...p, listaFechada: !p.listaFechada } : p,
    );
    await savePartidas(updated);
  };

  const adicionarPost = async (name: string, content: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      name,
      time: 'Agora mesmo',
      content,
      likes: 0,
      commentsCount: 0,
      liked: false,
    };
    await savePosts([newPost, ...posts]);
  };

  const toggleLikePost = async (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const liked = !p.liked;
        const likes = liked ? p.likes + 1 : p.likes - 1;
        return { ...p, liked, likes };
      }
      return p;
    });
    await savePosts(updated);
  };

  const comentarPost = async (postId: string, texto: string, autor: string) => {
    const conteudo = texto.trim();
    if (!conteudo) return;
    const novo: Comentario = {
      id: `c-${Date.now()}`,
      autor,
      texto: conteudo,
      tempo: 'Agora mesmo',
      respostas: [],
    };
    const updated = posts.map((p) =>
      p.id === postId
        ? { ...p, commentsCount: p.commentsCount + 1, comentarios: [...(p.comentarios ?? []), novo] }
        : p,
    );
    await savePosts(updated);
  };

  const responderComentario = async (
    postId: string,
    comentarioId: string,
    texto: string,
    autor: string,
  ) => {
    const conteudo = texto.trim();
    if (!conteudo) return;
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const comentarios = (p.comentarios ?? []).map((c) =>
        c.id === comentarioId
          ? {
              ...c,
              respostas: [
                ...c.respostas,
                { id: `r-${Date.now()}`, autor, texto: conteudo, tempo: 'Agora mesmo' },
              ],
            }
          : c,
      );
      return { ...p, commentsCount: p.commentsCount + 1, comentarios };
    });
    await savePosts(updated);
  };

  const reservarCampo = async (campoId: string, data: string, horario: string) => {
    const campo = campos.find((c) => c.id === campoId);
    if (!campo) return;

    const newReserva: Reserva = {
      id: `reserva-${Date.now()}`,
      campoId,
      campoNome: campo.nome,
      data,
      horario,
      preco: campo.precoHora,
    };
    await saveReservas([newReserva, ...reservas]);
  };

  const inscreverTorneio = async (torneioId: string) => {
    const updated = torneios.map((t) => {
      if (t.id === torneioId) {
        return { ...t, inscrito: true, nextMatch: 'Aguardando sorteio de chaves' };
      }
      return t;
    });
    await saveTorneios(updated);
  };

  const cancelarInscricao = async (torneioId: string) => {
    const updated = torneios.map((t) =>
      t.id === torneioId ? { ...t, inscrito: false, nextMatch: undefined } : t,
    );
    await saveTorneios(updated);
  };

  const criarPartida = async (titulo: string, local: string, quando: string, totalVagas: number) => {
    const newPartida: Partida = {
      id: `p-${Date.now()}`,
      titulo,
      local,
      quando,
      vagas: { ocupadas: 1, total: totalVagas },
      status: 'aberta',
      confirmado: true,
    };
    await savePartidas([newPartida, ...partidas]);
  };

  return (
    <DataContext.Provider
      value={{
        partidas,
        campos,
        posts,
        torneios,
        reservas,
        togglePresenca,
        toggleListaPartida,
        adicionarPost,
        toggleLikePost,
        comentarPost,
        responderComentario,
        reservarCampo,
        inscreverTorneio,
        cancelarInscricao,
        criarPartida,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
}
