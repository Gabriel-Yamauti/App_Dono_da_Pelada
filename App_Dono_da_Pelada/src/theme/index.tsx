/**
 * Sistema de tema — "Dono da Pelada".
 *
 * Expõe um único objeto `theme` (cores + tokens) e um `ThemeProvider`/`useTheme`
 * para consumo via contexto. DEGRADAÇÃO GRACIOSA (requisito da tarefa): se o
 * provider não estiver montado, `useTheme()` devolve o tema padrão em vez de
 * lançar erro — o app nunca fica sem cores.
 */

import React, { createContext, useContext } from 'react';

import { palette } from './colors';
import { radius, spacing, typography } from './tokens';

export const theme = {
  colors: palette,
  typography,
  spacing,
  radius,
} as const;

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({
  children,
  value = theme,
}: {
  children: React.ReactNode;
  value?: Theme;
}) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook de acesso ao tema. Nunca lança: na ausência de provider o
 * `createContext(theme)` já garante o fallback para o tema padrão.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext) ?? theme;
}

export { palette } from './colors';
export { radius, spacing, typography } from './tokens';
