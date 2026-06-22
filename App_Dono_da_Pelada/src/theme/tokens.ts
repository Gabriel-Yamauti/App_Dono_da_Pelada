/**
 * Tokens de tipografia, espaçamento e raios.
 * Títulos condensados/bold; corpo legível (CLAUDE.md §2).
 */

export const typography = {
  // Configurado com as fontes Google Fonts carregadas via expo-font
  family: {
    title: 'Space Grotesk' as string | undefined,
    body: 'Manrope' as string | undefined,
    lexend: 'Lexend' as string | undefined,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
    display: 40, // títulos-herói condensados ("MEUS JOGOS", "RESERVAR ARENA")
  },
  weight: {
    regular: '400' as const,
    medium: '600' as const,
    bold: '800' as const, // títulos "condensados/bold"
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
