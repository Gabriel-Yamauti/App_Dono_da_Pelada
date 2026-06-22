/**
 * Dados MOCK hardcoded para as abas.
 *
 * Servem de degradação graciosa: enquanto as features reais (banco/API) não
 * existem, as telas renderizam estes dados estáticos em vez de quebrar.
 * NUNCA contém PII real (sem CPF — CH-15); apenas nomes de exibição fictícios.
 */

export type TabMock = {
  titulo: string;
  subtitulo: string;
  itens: { id: string; titulo: string; detalhe: string }[];
};

export const tabMocks: Record<string, TabMock> = {
  jogos: {
    titulo: 'Jogos',
    subtitulo: 'Suas peladas — hoster, futuras e anteriores',
    itens: [
      { id: 'j1', titulo: 'Pelada de Quinta', detalhe: 'Hoje · 20h · Society do Zé' },
      { id: 'j2', titulo: 'Racha do Bairro', detalhe: 'Sáb · 09h · Quadra Central' },
      { id: 'j3', titulo: 'Fut de Domingo', detalhe: 'Anterior · você fez 2 gols' },
    ],
  },
  coletivo: {
    titulo: 'Coletivo',
    subtitulo: 'Comunidade, torneios e ranking',
    itens: [
      { id: 'c1', titulo: 'Ranking da Várzea', detalhe: 'Você está em 7º' },
      { id: 'c2', titulo: 'Copa do Bairro', detalhe: 'Inscrições abertas' },
      { id: 'c3', titulo: 'Comunidade', detalhe: 'Funcionalidade em desenvolvimento…' },
    ],
  },
  reservas: {
    titulo: 'Reservas',
    subtitulo: 'Marketplace de campos',
    itens: [
      { id: 'r1', titulo: 'Society do Zé', detalhe: 'R$ 120/h · grama sintética' },
      { id: 'r2', titulo: 'Quadra Central', detalhe: 'R$ 90/h · coberta' },
      { id: 'r3', titulo: 'Arena Bola na Rede', detalhe: 'R$ 150/h · vestiário' },
    ],
  },
  perfil: {
    titulo: 'Perfil',
    subtitulo: 'Métricas, assiduidade e conquistas',
    itens: [
      { id: 'p1', titulo: 'Assiduidade', detalhe: '92% de presença' },
      { id: 'p2', titulo: 'Selo de Confiança', detalhe: 'Confiável' },
      { id: 'p3', titulo: 'Conquistas', detalhe: '5 medalhas' },
    ],
  },
};

/** Acesso tolerante a falha: chave inexistente devolve um mock vazio seguro. */
export function getTabMock(key: string): TabMock {
  return (
    tabMocks[key] ?? {
      titulo: 'Indisponível',
      subtitulo: 'Conteúdo temporariamente indisponível',
      itens: [],
    }
  );
}
