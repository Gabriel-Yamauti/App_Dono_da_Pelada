/**
 * Testes do gerador de elenco (Problema D). Função pura e determinística.
 */
import { buildRoster } from '../roster';
import type { Partida } from '../../../context/DataContext';

const base: Partida = {
  id: 'p1',
  titulo: 'Racha de Teste',
  local: 'Arena',
  quando: 'Hoje',
  vagas: { ocupadas: 5, total: 10 },
  status: 'aberta',
};

describe('buildRoster', () => {
  it('gera exatamente `vagas.ocupadas` jogadores', () => {
    expect(buildRoster(base)).toHaveLength(5);
  });

  it('inclui o usuário logado como "(Você)" quando ele confirmou', () => {
    const roster = buildRoster({ ...base, confirmado: true }, 'Maria Gol');
    expect(roster[0].voce).toBe(true);
    expect(roster[0].nome).toContain('Maria Gol');
    expect(roster).toHaveLength(5);
  });

  it('inclui o usuário como organizador quando é hoster', () => {
    const roster = buildRoster({ ...base, status: 'hoster' }, 'Zé Hoster');
    expect(roster[0].voce).toBe(true);
    expect(roster[0].posicao).toBe('Organizador');
  });

  it('não inclui o usuário quando ele não participa', () => {
    const roster = buildRoster({ ...base, confirmado: false }, 'Fulano');
    expect(roster.some((j) => j.voce)).toBe(false);
  });

  it('é determinístico (mesma entrada → mesma saída)', () => {
    expect(buildRoster(base)).toEqual(buildRoster(base));
  });
});
