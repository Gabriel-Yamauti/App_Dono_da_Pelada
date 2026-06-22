/**
 * Dados MOCK (hardcoded) da aba Coletivo.
 *
 * Arrays fixos para degradação graciosa enquanto a feature real (T1.7) não existe.
 * NUNCA contém PII real (sem CPF — CH-15); apenas nomes de exibição fictícios.
 */

export type CommunityPost = {
  id: string;
  autor: string;
  /** iniciais para o avatar placeholder (sem imagem de rede — 100% local) */
  iniciais: string;
  tempo: string;
  conteudo: string;
  curtidas: number;
  comentarios: number;
};

export type RankingEntry = {
  id: string;
  posicao: number;
  nome: string;
  iniciais: string;
  pontos: number;
  /** marca a linha do próprio usuário para destaque visual */
  voce?: boolean;
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    autor: 'Marcão da Vila',
    iniciais: 'MV',
    tempo: 'há 12 min',
    conteudo: 'Faltam 2 pra fechar o time de quinta no Society do Zé. Bora, galera! ⚽',
    curtidas: 18,
    comentarios: 5,
  },
  {
    id: 'p2',
    autor: 'Bia Ferreira',
    iniciais: 'BF',
    tempo: 'há 1 h',
    conteudo: 'Que jogão ontem na Copa do Bairro. Golaço de bicicleta no último minuto! 🚲🔥',
    curtidas: 47,
    comentarios: 12,
  },
  {
    id: 'p3',
    autor: 'Pelada FC',
    iniciais: 'PF',
    tempo: 'há 3 h',
    conteudo: 'Ranking atualizado! Subimos 3 posições essa semana. Próximo desafio é sábado.',
    curtidas: 29,
    comentarios: 8,
  },
  {
    id: 'p4',
    autor: 'Rafa Goleiro',
    iniciais: 'RG',
    tempo: 'há 6 h',
    conteudo: 'Procurando racha aos domingos de manhã na zona sul. Alguém indica?',
    curtidas: 11,
    comentarios: 3,
  },
];

export const LOCAL_RANKING: RankingEntry[] = [
  { id: 'r1', posicao: 1, nome: 'Os Feras', iniciais: 'OF', pontos: 1280 },
  { id: 'r2', posicao: 2, nome: 'Bola na Rede', iniciais: 'BR', pontos: 1190 },
  { id: 'r3', posicao: 3, nome: 'Galáticos da Várzea', iniciais: 'GV', pontos: 1145 },
  { id: 'r4', posicao: 4, nome: 'Resenha FC', iniciais: 'RF', pontos: 980 },
  { id: 'r5', posicao: 7, nome: 'Seu Time', iniciais: 'ST', pontos: 720, voce: true },
];
