/**
 * Testes do ranking atrelado ao usuário da sessão (Problema G). Funções puras.
 */
import { buildCraques, computeUserStats } from '../ranking';
import type { Partida } from '../../../context/DataContext';

const encerrada = (gols: number, assist: number, rating: number): Partida => ({
  id: `p-${gols}-${assist}-${rating}`,
  titulo: 'Jogo',
  local: 'Arena',
  quando: 'Ontem',
  vagas: { ocupadas: 10, total: 10 },
  status: 'encerrada',
  gols,
  assistencias: assist,
  rating,
});

describe('computeUserStats', () => {
  it('soma gols/assistências e calcula a média de rating das encerradas', () => {
    const stats = computeUserStats([encerrada(2, 1, 8), encerrada(1, 0, 6)]);
    expect(stats.gols).toBe(3);
    expect(stats.assist).toBe(1);
    expect(stats.rating).toBeCloseTo(7);
  });

  it('usa rating padrão quando não há partidas encerradas', () => {
    expect(computeUserStats([]).rating).toBe(7.5);
  });
});

describe('buildCraques', () => {
  it('inclui o usuário marcado como "(Você)" exatamente uma vez', () => {
    const lista = buildCraques('Maria Gol', { gols: 5, assist: 2, rating: 8.5 });
    const meus = lista.filter((c) => c.voce);
    expect(meus).toHaveLength(1);
    expect(meus[0].nome).toContain('MARIA GOL');
  });

  it('ordena por rating decrescente e numera as posições', () => {
    const lista = buildCraques('Fulano', { gols: 0, assist: 0, rating: 9.9 });
    // Rating altíssimo → usuário em 1º.
    expect(lista[0].voce).toBe(true);
    expect(lista[0].pos).toBe('01');
    const ratings = lista.map((c) => Number(c.rating));
    const ordenado = [...ratings].sort((a, b) => b - a);
    expect(ratings).toEqual(ordenado);
  });
});
