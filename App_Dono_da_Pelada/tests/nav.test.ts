import { describe, expect, it } from '@jest/globals';

import { TABS } from '../src/lib/tabs';
import { getTabMock, tabMocks } from '../src/lib/mocks';

describe('navegação — as 4 abas (CLAUDE.md §1)', () => {
  it('define exatamente Jogos · Coletivo · Reservas · Perfil', () => {
    expect(TABS.map((t) => t.label)).toEqual(['Jogos', 'Coletivo', 'Reservas', 'Perfil']);
  });

  it('tem "index" como rota inicial (Jogos)', () => {
    expect(TABS[0].name).toBe('index');
    expect(TABS[0].key).toBe('jogos');
  });

  it('usa ícones outline em todas as abas', () => {
    for (const t of TABS) {
      expect(t.icon).toMatch(/-outline$/);
    }
  });

  it('cada aba tem um mock correspondente', () => {
    for (const t of TABS) {
      expect(tabMocks[t.key]).toBeDefined();
    }
  });
});

describe('degradação graciosa dos mocks', () => {
  it('devolve mock vazio seguro para chave inexistente', () => {
    const m = getTabMock('inexistente');
    expect(m.itens).toEqual([]);
    expect(typeof m.titulo).toBe('string');
  });

  it('nenhum mock expõe CPF (CH-15)', () => {
    const blob = JSON.stringify(tabMocks);
    expect(blob).not.toMatch(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
  });
});
