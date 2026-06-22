import { describe, expect, it } from '@jest/globals';

import { palette, theme } from '../src/theme';

describe('tema — identidade visual (CLAUDE.md §2)', () => {
  it('usa fundo verde-escuro/cinza e destaque verde-limão', () => {
    expect(theme.colors.greenBackground).toBe('#131313');
    expect(theme.colors.lime).toBe('#c3f400');
  });

  it('expõe a paleta completa do tema escuro (CH-05)', () => {
    // tokens mínimos que toda tela precisa
    for (const token of ['greenBackground', 'greenSurface', 'textPrimary', 'lime'] as const) {
      expect(typeof palette[token]).toBe('string');
      expect(palette[token]).toMatch(/^#|rgba/);
    }
  });

  it('garante contraste de texto sobre o botão limão (texto escuro)', () => {
    expect(theme.colors.textOnLime).toBe(theme.colors.greenBackground);
  });

  it('inclui tokens de tipografia, espaçamento e raio', () => {
    expect(theme.typography.weight.bold).toBe('800');
    expect(theme.spacing.md).toBe(16);
    expect(theme.radius.md).toBeGreaterThan(0);
  });
});
