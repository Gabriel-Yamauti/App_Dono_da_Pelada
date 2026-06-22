/**
 * Geração do elenco (jogadores) de uma partida — Dono da Pelada.
 *
 * O modelo de partida (mockup) guarda apenas a contagem de vagas ocupadas, não
 * a lista nominal. Aqui derivamos um elenco DETERMINÍSTICO e plausível a partir
 * dessa contagem, sempre incluindo o usuário da sessão quando ele participa
 * (confirmado, hoster ou dono da partida) — atrelando a UI ao usuário logado.
 *
 * Sem PII (sem CPF — CH-15): apenas nomes de exibição fictícios.
 */
import type { Partida } from '../../context/DataContext';

export type JogadorPartida = {
  id: string;
  nome: string;
  posicao: string;
  /** É o usuário logado. */
  voce?: boolean;
};

/** Nomes fictícios de exibição (não são pessoas reais). */
const POOL_NOMES = [
  'Lucas Silva', 'Gabriel Santos', 'Mateus Oliveira', 'Rafael Souza',
  'Bruno Lima', 'Thiago Costa', 'Felipe Almeida', 'Pedro Ferreira',
  'Gustavo Rocha', 'André Dias', 'Diego Nunes', 'Vinícius Moraes',
  'Caio Castro', 'Rodrigo Campos', 'Marcelo Pinto', 'Eduardo Mendes',
];

const POSICOES = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];

/**
 * Constrói o elenco de uma partida com `vagas.ocupadas` jogadores. Se o usuário
 * participa, ele entra em primeiro como "(Você)". Determinístico (sem random).
 */
export function buildRoster(partida: Partida, userName?: string | null): JogadorPartida[] {
  const total = Math.max(0, partida.vagas?.ocupadas ?? 0);
  const lista: JogadorPartida[] = [];

  const usuarioParticipa =
    !!userName && (partida.confirmado || partida.status === 'hoster');

  if (usuarioParticipa) {
    lista.push({
      id: 'voce',
      nome: `${userName} (Você)`,
      posicao: partida.status === 'hoster' ? 'Organizador' : 'Atacante',
      voce: true,
    });
  }

  let i = 0;
  while (lista.length < total) {
    lista.push({
      id: `j-${i}`,
      nome: POOL_NOMES[i % POOL_NOMES.length],
      posicao: POSICOES[i % POSICOES.length],
    });
    i++;
  }

  return lista.slice(0, total);
}
