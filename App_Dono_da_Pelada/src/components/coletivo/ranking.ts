/**
 * Ranking de craques atrelado ao usuário da sessão (Problema G).
 *
 * O ranking deixa de ser hardcoded ("Ricardo Lopes") e passa a INCLUIR o
 * usuário logado, marcado como "(Você)", posicionado pelo seu rating real
 * (calculado a partir das partidas encerradas dele). Os demais são nomes de
 * comunidade fictícios (sem PII — CH-15).
 */
import type { Partida } from '../../context/DataContext';

export type CraqueRanking = {
  pos: string;
  nome: string;
  time: string;
  rating: string;
  gols: number;
  assist: number;
  voce?: boolean;
};

/** Craques fictícios da comunidade (base do ranking). */
const COMUNIDADE = [
  { nome: 'Bruno "Muro" Silva', time: 'Cavaiús United', rating: 9.4, gols: 11, assist: 4 },
  { nome: 'Diego Maradona Jr', time: 'El Clássico', rating: 9.1, gols: 13, assist: 7 },
  { nome: 'Lucas Andrade', time: 'Resenha F.C.', rating: 8.7, gols: 9, assist: 5 },
  { nome: 'Rafael Gomes', time: 'Os Donos da Bola', rating: 8.4, gols: 7, assist: 8 },
  { nome: 'Thiago Costa', time: 'Galáticos FC', rating: 8.1, gols: 6, assist: 3 },
];

export type UserStats = { gols: number; assist: number; rating: number };

/** Calcula os números do usuário a partir das partidas encerradas dele. */
export function computeUserStats(partidas: Partida[]): UserStats {
  const passadas = partidas.filter((p) => p.status === 'encerrada');
  const gols = passadas.reduce((s, p) => s + (p.gols ?? 0), 0);
  const assist = passadas.reduce((s, p) => s + (p.assistencias ?? 0), 0);
  const ratings = passadas
    .map((p) => p.rating)
    .filter((r): r is number => typeof r === 'number');
  const rating = ratings.length
    ? ratings.reduce((s, r) => s + r, 0) / ratings.length
    : 7.5;
  return { gols, assist, rating };
}

/**
 * Constrói o ranking ordenado por rating, inserindo o usuário da sessão
 * (marcado `voce: true`) na posição correspondente ao seu rating.
 */
export function buildCraques(userName: string, stats: UserStats): CraqueRanking[] {
  const todos = [
    ...COMUNIDADE.map((c) => ({ ...c, voce: false })),
    {
      nome: userName,
      time: 'Seu time',
      rating: stats.rating,
      gols: stats.gols,
      assist: stats.assist,
      voce: true,
    },
  ];

  todos.sort((a, b) => b.rating - a.rating);

  return todos.map((c, i) => ({
    pos: String(i + 1).padStart(2, '0'),
    nome: c.nome.toUpperCase(),
    time: c.time.toUpperCase(),
    rating: c.rating.toFixed(1),
    gols: c.gols,
    assist: c.assist,
    voce: c.voce,
  }));
}
